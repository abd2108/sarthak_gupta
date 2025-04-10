const { jobMap, removeJobFromMap, addJobToMap } = require('./jobMap');
const { addToQueue } = require('./worker');
const Job = require('../models/jobModel');

function startScheduler() {
  setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000); // current epoch in seconds

    const jobsToRun = jobMap.get(currentTime);
    if (jobsToRun && jobsToRun.length > 0) {
      console.log(`⏰ Found ${jobsToRun.length} job(s) at ${currentTime}`);

      // Iterate over each job found at this timestamp
      jobsToRun.forEach(job => {
        if (!job || !job._id) {
          console.error("❌ Skipping invalid job:", job);
          return;
        }

        // Convert Mongoose job to plain object if necessary
        const jobObject = job instanceof Job ? job.toObject() : job;

        // Add job to the queue for execution
        addToQueue(jobObject);

        // Remove the job from the map after it's been processed
        removeJobFromMap(jobObject._id, currentTime);

        // Check if the job is recurring and reschedule it
        if (jobObject.type === 'recurring') {
          const nextTime = Math.floor(Date.now() / 1000) + jobObject.interval;
        
          // Retrieve existing jobs for the next timestamp
          let existingJobs = jobMap.get(nextTime);
        
          // If no jobs are scheduled for the next time, initialize an empty array
          if (!existingJobs) {
            existingJobs = [];
            jobMap.set(nextTime, existingJobs); // Ensure the timestamp has an array for jobs
          }
        
          // Add the current job to the list of jobs for the next scheduled timestamp
          existingJobs.push({ ...jobObject, timestamp: nextTime });
        
          console.log(`🔁 Rescheduled recurring job "${jobObject.name}" for ${nextTime}`);
        }
      });

      // Once all jobs are executed, remove them from the map.
      jobMap.delete(currentTime);
    }
  }, 1000); // The scheduler runs every second
}

module.exports = { startScheduler };
