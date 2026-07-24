require('dotenv').config();

// Probes the sign-in endpoint with MongoDB query operators in place of the
// strings it expects. Run before and after input validation is added, to show
// whether the operators reach the database.
//
//   node backend/scripts/probe-login.js

const BASE = process.env.BENCHMARK_URL || 'http://localhost:5000';

const CASES = [
  {
    name: 'Valid credentials',
    body: { email: 'dr.kuteishi@intellicare.ca', password: 'Password123!' },
    expect: 'signs in',
  },
  {
    name: 'Wrong password',
    body: { email: 'dr.kuteishi@intellicare.ca', password: 'wrong' },
    expect: 'rejected',
  },
  {
    name: 'Unknown address',
    body: { email: 'nobody@example.com', password: 'whatever' },
    expect: 'rejected',
  },
  {
    name: 'Operator in email',
    body: { email: { $ne: null }, password: 'whatever' },
    expect: 'must be rejected without reaching the database',
  },
  {
    name: 'Operator in email and password',
    body: { email: { $ne: null }, password: { $ne: null } },
    expect: 'must be rejected without reaching the database',
  },
  {
    name: 'Expression in email',
    body: { email: { $regex: '^dr' }, password: 'whatever' },
    expect: 'must be rejected without reaching the database',
  },
  {
    name: 'Expression matching any address',
    body: { email: { $regex: '.*' }, password: { $gt: '' } },
    expect: 'must be rejected without reaching the database',
  },
];

const attempt = async (body) => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = {};
  }
  return { status: res.status, payload };
};

const verdict = (status, payload) => {
  if (status === 200 && payload.token) return 'AUTHENTICATED';
  if (status === 400) return 'rejected by validation';
  if (status === 401) return 'rejected as bad credentials';
  if (status === 500) return `REACHED THE DATABASE (${payload.message || 'server error'})`;
  return `status ${status}`;
};

const run = async () => {
  console.log(`Sign-in probe against ${BASE}\n`);

  for (const testCase of CASES) {
    const { status, payload } = await attempt(testCase.body);
    console.log(testCase.name);
    console.log(`  sent:     ${JSON.stringify(testCase.body)}`);
    console.log(`  expected: ${testCase.expect}`);
    console.log(`  result:   ${verdict(status, payload)}`);
    console.log('');
  }

  console.log('A result of REACHED THE DATABASE means the operator was passed');
  console.log('into the query. The password comparison happens to fail on a');
  console.log('non-string, but the account was already selected by then.');
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
