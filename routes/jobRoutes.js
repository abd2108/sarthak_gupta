const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const { addJobToMap } = require('../scheduler/jobMap');

// POST /add-job
router.post('/add-job', async (req, res) => {
  try {
    const { name, type, timestamp, interval, payload } = req.body;

    // Create and save job in DB
    const job = new Job({ name, type, timestamp, interval, payload });
    await job.save();

    // Add to in-memory map
    addJobToMap(job);

    res.status(201).json({ message: 'Job scheduled successfully!', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule job' });
  }
});

module.exports = router;
