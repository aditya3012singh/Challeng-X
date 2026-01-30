// uses docker images for different languages to sandbox code execution

// MOST IMPORTANT PART

// It:

// • Writes code to file
// • Runs Docker container
// • Feeds testcases
// • Captures output
// • Compares expected output

// Returns:

// PASS / FAIL + time.