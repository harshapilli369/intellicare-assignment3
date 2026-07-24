require('dotenv').config();

// Times the endpoints behind the two features under test, so the effect of an
// individual optimization can be attributed to it rather than inferred from a
// whole load test run.
//
//   node backend/scripts/benchmark.js [runs]

const BASE = process.env.BENCHMARK_URL || 'http://localhost:5000';
const RUNS = Number(process.argv[2]) || 5;

const ENDPOINTS = [
  { name: 'dashboard stats', path: '/api/dashboard/stats' },
  { name: 'patient list', path: '/api/patients?page=1&limit=20' },
  { name: 'patient search', path: '/api/patients?search=an&page=1&limit=20' },
  { name: 'patient record', path: '/api/patients/1' },
  { name: 'appointments', path: '/api/appointments' },
];

const login = async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.kuteishi@intellicare.ca',
      password: 'Password123!',
    }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return (await res.json()).token;
};

const time = async (path, token) => {
  const started = process.hrtime.bigint();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await res.text();
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  return { ms, status: res.status };
};

const run = async () => {
  const token = await login();

  console.log(`${BASE} - ${RUNS} runs per endpoint\n`);
  console.log('endpoint          status      min      avg      max');
  console.log('-'.repeat(52));

  for (const endpoint of ENDPOINTS) {
    const samples = [];
    let status = 0;

    // One untimed call first, so a cold connection or an empty cache does not
    // land on the first measured sample.
    await time(endpoint.path, token);

    for (let i = 0; i < RUNS; i += 1) {
      const result = await time(endpoint.path, token);
      samples.push(result.ms);
      status = result.status;
    }

    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;

    const cell = (value) => `${value.toFixed(0)} ms`.padStart(8);
    console.log(
      `${endpoint.name.padEnd(18)}${String(status).padEnd(6)}${cell(min)}${cell(avg)}${cell(max)}`
    );
  }
};

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
