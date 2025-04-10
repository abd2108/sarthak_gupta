const Job = require('../models/jobModel');
const { exec } = require('child_process');

let jobQueue = []; // In-memory queue
let isProcessing = false;
const jobMap = new Map(); // Needed for recurring jobs

// ✅ Add job to queue and process
async function addToQueue(job) {
  try {
    jobQueue.push(job);
    console.log(`📝 Job "${job.name}" added to the queue`);

    // ❗ Remove _id if present
    const jobToSave = { ...job };
    delete jobToSave._id;

    const newJob = new Job(jobToSave);
    await newJob.save();
    console.log(`📝 Job "${job.name}" saved to the database`);

    // 🔄 Start processing if not already
    if (!isProcessing) {
      processQueue();
    }
  } catch (error) {
    console.error(`❌ Failed to add job "${job.name}":`, error);
  }
}

// ✅ Process the queue
async function processQueue() {
  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    console.log(`⚙️ Executing job: "${job.name}"`);

    await executeJob(job);

    await Job.updateOne({ _id: job._id }, { $set: { status: 'completed' } });

    if (job.type === 'recurring') {
      const nextTime = job.timestamp + job.interval;
      const existingJobs = jobMap.get(nextTime) || [];
      existingJobs.push(job);
      jobMap.set(nextTime, existingJobs);
    }
  }

  isProcessing = false;
}

// ✅ Execute a job (Shell Command)
function executeJob(job) {
  return new Promise((resolve) => {
    const command = job.payload.command;

    if (!command) {
      console.error(`❌ Invalid command for job: "${job.name}"`);
      return resolve();
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Execution failed for "${job.name}": ${error.message}`);
        return resolve();
      }

      // stderr can include curl download progress — not always an error
      if (stderr.toLowerCase().includes('error')) {
        console.error(`❌ stderr output in "${job.name}": ${stderr}`);
      }

      console.log(`✅ Job "${job.name}" executed:\n${stdout}`);
      resolve();
    });
  });
}

// Worker entry point — optional placeholder
function startWorker() {
  // Can be used to reprocess future jobs or scheduled queue
}

module.exports = { addToQueue, startWorker };
