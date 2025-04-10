const express = require('express');
const mongoose = require('mongoose');
const jobRoutes = require('./routes/jobRoutes');
const { loadJobsFromDB } = require('./scheduler/jobMap');
const { startScheduler } = require('./scheduler/scheduler');
const { startWorker } = require('./scheduler/worker'); // ✅ add this
const connectDB = require('./db');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// API routes
app.use('/api', jobRoutes);

// Connect to MongoDB and start everything
connectDB()
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    await loadJobsFromDB();     // load jobs into jobMap
    startScheduler();           // start the scheduler loop
    startWorker();              // ✅ start the job executor

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB', err);
  });
