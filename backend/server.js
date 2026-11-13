const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectMongoDB } = require('./src/config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect optional MongoDB
connectMongoDB();

// Mount Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/doctors', require('./src/routes/doctors'));
app.use('/api/patients', require('./src/routes/patients'));
app.use('/api/appointments', require('./src/routes/appointments'));
app.use('/api/records', require('./src/routes/records'));
app.use('/api/prescriptions', require('./src/routes/prescriptions'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/departments', require('./src/routes/admin')); // maps to department handler
app.use('/api/notifications', require('./src/routes/notifications'));

// Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Healthcare Management API is operational',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🩺 Healthcare Backend Server running on http://localhost:${PORT}`);
});
