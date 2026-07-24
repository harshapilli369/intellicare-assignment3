require('dotenv').config();
const mongoose = require('mongoose');

const { connectMongoDB } = require('../src/config/mongodb');
const Patient = require('../src/models/mongodb/Patient');

// Populates nameTokens on patients created before the field existed. Run in
// place rather than reseeding, so the collection keeps the same records and
// measurements taken before and after remain comparable.
const BATCH_SIZE = 5000;

// Records written before the field existed have no nameTokens at all, so a
// check for an empty array alone would not find them.
const MISSING_TOKENS = {
  $or: [{ nameTokens: { $exists: false } }, { nameTokens: { $size: 0 } }],
};

const run = async () => {
  await connectMongoDB();

  const total = await Patient.countDocuments({});
  const pending = await Patient.countDocuments(MISSING_TOKENS);
  console.log(`${total} patients, ${pending} without tokens`);

  if (pending === 0) {
    console.log('Nothing to backfill');
    await mongoose.connection.close();
    return;
  }

  let processed = 0;
  let operations = [];

  const cursor = Patient.find(MISSING_TOKENS, { name: 1 }).lean().cursor();

  const flush = async () => {
    if (operations.length === 0) return;
    await Patient.bulkWrite(operations, { ordered: false });
    processed += operations.length;
    operations = [];
    console.log(`  ${processed}/${pending}`);
  };

  for await (const patient of cursor) {
    operations.push({
      updateOne: {
        filter: { _id: patient._id },
        update: { $set: { nameTokens: Patient.tokenise(patient.name) } },
      },
    });
    if (operations.length >= BATCH_SIZE) await flush();
  }
  await flush();

  console.log('\nEnsuring indexes exist');
  await Patient.syncIndexes();
  const indexes = await Patient.collection.indexes();
  console.log(`  ${indexes.map((i) => i.name).join(', ')}`);

  await mongoose.connection.close();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
