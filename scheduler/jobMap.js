const Job = require('../models/jobModel');

// Global in-memory map: Map<timestamp, [job]>
const jobMap = new Map();

// Add a single job to the map
function addJobToMap(job) {
  const ts = job.timestamp;
  if (!ts) {
    console.error("❌ Tried to add job with no timestamp:", job);
    return;
  }

  // If timestamp already has jobs, push it, otherwise create a new array
  if (!jobMap.has(ts)) jobMap.set(ts, []);
  jobMap.get(ts).push(job);
}

// Load all future jobs from DB at startup
async function loadJobsFromDB() {
  const now = Math.floor(Date.now() / 1000); // Current epoch in seconds
  const futureJobs = await Job.find({ timestamp: { $gte: now } });

  futureJobs.forEach(job => {
    addJobToMap(job);
    console.log(`📦 Loaded job: ${job.name} scheduled at ${job.timestamp}`);
  });

  console.log(`✅ Total ${futureJobs.length} jobs loaded into jobMap.`);
}

// Remove a job from the map after execution
function removeJobFromMap(jobId, timestamp) {
  if (!jobId || typeof jobId.toString !== 'function') {
    console.error('❌ Invalid jobId provided for removal:', jobId);
    return;
  }

  if (jobMap.has(timestamp)) {
    const jobs = jobMap.get(timestamp).filter(job => job._id?.toString() !== jobId.toString());
    if (jobs.length === 0) {
      jobMap.delete(timestamp); // If no more jobs at this timestamp, remove the key
    } else {
      jobMap.set(timestamp, jobs); // Update the map with the remaining jobs
    }
  }
}

// Reschedule recurring job
function rescheduleJob(job) {
  const { timestamp, interval, type, _id } = job;
  
  // Only process recurring jobs
  if (type === 'recurring' && interval) {
    const newTimestamp = timestamp + interval;

    // Create a new job with the updated timestamp
    const newJob = { ...job, timestamp: newTimestamp, _id: undefined }; // Set _id to undefined to treat it as a new job
    removeJobFromMap(_id, timestamp); // Remove the job from its old timestamp
    addJobToMap(newJob); // Add the new job at the updated timestamp

    console.log(`🔁 Rescheduled job "${job.name}" from ${timestamp} to ${newTimestamp}`);
  }
}

// Exported stuff
module.exports = {
  jobMap,
  addJobToMap,
  loadJobsFromDB,
  removeJobFromMap,
  rescheduleJob
};
