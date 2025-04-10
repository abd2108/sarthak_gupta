let jobQueue = []; // This will be our global queue

// Function to add jobs to the queue
function addToQueue(job) {
  jobQueue.push(job);
  console.log(`📝 Job "${job.name}" added to the queue`);
}

// Function to process jobs from the queue
function processQueue() {
  // Continue processing as long as the queue is not empty
  while (jobQueue.length > 0) {
    // Get the first job in the queue
    const job = jobQueue.shift();

    console.log(`⚙️ Executing job: "${job.name}"`);

    // Here we execute the job (can be customized to run actual commands, etc.)
    executeJob(job);
  }
}

// Function to simulate job execution (replace with actual job execution logic)
function executeJob(job) {
    const { exec } = require('child_process');
    
    // Accessing the command inside the payload object
    const command = job.payload.command;
  
    if (!command) {
      console.error(`❌ Invalid command for job: "${job.name}"`);
      return;
    }
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Custom error message for failed command
        console.error(`❌ Job execution failed: Error: Try a valid command`);
        return;
      }
      if (stderr) {
        // Custom error message for stderr output (if any)
        console.error(`❌ Job execution error: Try a valid command`);
        return;
      }
  
      console.log(`✅ Job executed successfully: ${stdout}`);
    });
  }
  

// Worker constantly processes jobs in the queue
function startWorker() {
  setInterval(() => {
    if (jobQueue.length > 0) {
      processQueue();
    }
  }, 1000); // Check for jobs every second
}

module.exports = { addToQueue, startWorker };
