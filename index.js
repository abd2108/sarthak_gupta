const express = require('express');
const connectDB = require('./db'); 
const mongoose = require('mongoose');
const jobRoutes = require('./routes/jobRoutes');
const { startScheduler } = require('./scheduler/scheduler');
const { startWorker } = require('./scheduler/worker');
const { jobMap, loadJobsFromDB } = require('./scheduler/jobMap');
//const { addToQueue } = require('./scheduler/worker');
//const jobRoutes = require('./routes/jobRoutes');
const Job = require('./models/jobModel');
const app = express();
const PORT = 3000;
const Router = require ('./routes/jobRoutes');
// Middleware
app.use(express.json());

// API routes
app.use('/api', jobRoutes);
 //addToQueue(Job);
// Main startup flow
connectDB()
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Load all future jobs into memory
    await loadJobsFromDB();

    // Start the scheduler loop and worker
    startScheduler();
    startWorker();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to DB:', err);
  });
