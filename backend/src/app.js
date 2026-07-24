require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectMongoDB } = require('./config/mongodb');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  helmet({
    // Helmet's defaults allow any https origin for styles and fonts. That was
    // only ever needed for the hosted font, which is now served from here, so
    // the policy names this origin and nothing else.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        scriptSrc: ["'self'"],
        // Inline styles remain permitted. React sets element styles directly
        // and the date picker positions itself that way, so removing this
        // would break the interface rather than harden it. Narrowing it
        // properly means moving those to classes or nonces.
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    // Neither is set by default. Both were reported by the scan.
    crossOriginEmbedderPolicy: true,
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// Helmet does not cover this header. Denies the browser features this
// application never uses.
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  next();
});

app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// The load test drives far more traffic than a real user would, so the global
// limit is lifted for that environment only. Without this the run measures the
// rate limiter rejecting requests rather than how the application performs.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'loadtest' ? 100000 : 200,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve the built frontend so the whole application is reachable on one origin.
const clientDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongoDB();
  app.listen(PORT, () => console.log(`IntelliCare API running on port ${PORT}`));
}

start();
