const express = require('express');
const router = express.Router();
const {Job} = require('../models/jobModel'); // Keep this import
const { addJobToMap,removeJobFromMap } = require('../scheduler/jobMap');

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

router.post('/remove-job', async (req, res) => {
    try {
      const { name, timestamp } = req.body;
  
      if (!name || !timestamp) {
        return res.status(400).json({ error: '❌ name and timestamp are required' });
      }
  
      await removeJobFromMap(name, timestamp);
  
      res.status(200).json({ message: `✅ Job "${name}" at timestamp ${timestamp} removed.` });
    } catch (err) {
      console.error(`❌ Failed to remove job:`, err);
      res.status(500).json({ error: 'Failed to remove job' });
    }
  });

module.exports = router;
