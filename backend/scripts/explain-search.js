require('dotenv').config();
const mongoose = require('mongoose');

const { connectMongoDB } = require('../src/config/mongodb');
const Patient = require('../src/models/mongodb/Patient');

// Reports how MongoDB executes the patient directory search. Used to capture
// evidence of the query plan before and after the search index is added.
const term = process.argv[2] || 'an';

const run = async () => {
  await connectMongoDB();

  const stats = await mongoose.connection.db.command({ collStats: 'patients' });
  console.log('Collection: patients');
  console.log(`  documents:   ${stats.count}`);
  console.log(`  avg doc size: ${stats.avgObjSize} bytes`);
  console.log(`  data size:   ${(stats.size / 1024 / 1024).toFixed(1)} MB`);

  const indexes = await Patient.collection.indexes();
  console.log(`  indexes:     ${indexes.map((i) => i.name).join(', ')}`);

  const report = async (label, query) => {
    const explain = await Patient.find(query).sort({ name: 1 }).limit(20).explain('executionStats');
    const s = explain.executionStats;
    console.log(`\n${label}`);
    console.log(`  query:               ${JSON.stringify(query)}`);
    console.log(`  winning stage:       ${explain.queryPlanner.winningPlan.stage}`);
    console.log(`  documents examined:  ${s.totalDocsExamined}`);
    console.log(`  index keys examined: ${s.totalKeysExamined}`);
    console.log(`  documents returned:  ${s.nReturned}`);
    console.log(`  execution time:      ${s.executionTimeMillis} ms`);
  };

  await report('Unindexed - case-insensitive match anywhere in the name', {
    name: { $regex: term, $options: 'i' },
  });

  await report('Indexed - anchored match against lowercased name tokens', {
    nameTokens: { $regex: `^${term.toLowerCase()}` },
  });

  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
