import sys
import json
import subprocess
import os
import time

def run_java():
    while True:
        line = sys.stdin.readline()
        if not line:
            break

        try:
            job = json.loads(line)
            code = job.get("code", "")
            inputs = job.get("inputs", [])
            early_exit = job.get("early_exit", True)

            # 1. Write the code to Main.java
            source_file = "Main.java"
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(code)

            # 2. Compile strings into Main.class
            # We redirect stderr to capture compilation errors
            compile_process = subprocess.run(
                ["javac", source_file],
                capture_output=True,
                text=True
            )

            if compile_process.returncode != 0:
                # Compilation failed
                # Return this error for EVERY input so the judge knows it's broken
                for index, _ in enumerate(inputs):
                    sys.stdout.write(json.dumps({
                        "type": "progress",
                        "index": index,
                        "passed": 0,
                        "error": "Compilation Error:\n" + compile_process.stderr
                    }) + "\n")
                    sys.stdout.flush()

                # Tell the judge we are completely finished evaluating this batch
                sys.stdout.write(json.dumps({
                    "type": "finished",
                    "results": [{"error": "Compilation Error:\n" + compile_process.stderr} for _ in inputs],
                    "stopped_at": 0
                }) + "\n")
                sys.stdout.flush()
                continue

            # 3. Execution Phase (For each inputs array)
            results = []
            stopped_at = len(inputs)
            passed_count = 0

            for i, test_input in enumerate(inputs):
                start_time = time.time()
                try:
                    # Run the compiled Main class
                    # Imposed a strict 2 second timeout per testcase inside the sandbox itself
                    run_process = subprocess.run(
                        ["java", "Main"],
                        input=test_input,
                        capture_output=True,
                        text=True,
                        timeout=2.0
                    )

                    if run_process.returncode == 0:
                        results.append({"output": run_process.stdout})
                        passed_count += 1
                        sys.stdout.write(json.dumps({
                            "type": "progress",
                            "index": i,
                            "passed": passed_count,
                            "output": run_process.stdout
                        }) + "\n")
                        sys.stdout.flush()
                    else:
                        results.append({"error": "Runtime Error:\n" + run_process.stderr})
                        sys.stdout.write(json.dumps({
                            "type": "progress",
                            "index": i,
                            "passed": passed_count,
                            "error": "Runtime Error:\n" + run_process.stderr
                        }) + "\n")
                        sys.stdout.flush()
                        
                        if early_exit:
                            stopped_at = i
                            break

                except subprocess.TimeoutExpired:
                   results.append({"error": "Time Limit Exceeded (2s)"})
                   sys.stdout.write(json.dumps({
                       "type": "progress",
                       "index": i,
                       "passed": passed_count,
                       "error": "Time Limit Exceeded (2s)"
                   }) + "\n")
                   sys.stdout.flush()
                   
                   if early_exit:
                       stopped_at = i
                       break

            # 4. Final summary
            sys.stdout.write(json.dumps({
                "type": "finished",
                "results": results,
                "stopped_at": stopped_at
            }) + "\n")
            sys.stdout.flush()

        except Exception as e:
            sys.stdout.write(json.dumps({
                "type": "finished",
                "results": [{"error": "Sandbox Engine Error: " + str(e)}],
                "stopped_at": 0
            }) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    run_java()
