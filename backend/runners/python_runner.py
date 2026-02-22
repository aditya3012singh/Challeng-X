"""
Warm container runner for Python submissions — BATCHED protocol.
One job = all test cases. Runs each input sequentially, stops on first failure.

Input:  {"code": "...", "inputs": ["input1", "input2", ...], "early_exit": true}\n
Output: {"results": [{"output":"..."}, {"error":"..."}], "stopped_at": 0}\n
        stopped_at = index of the first failure (or len(inputs) if all passed)
"""
import sys
import json
import subprocess
import tempfile
import os

def handle_job(job):
    code = job.get("code", "")
    inputs = job.get("inputs", [])
    early_exit = job.get("early_exit", True)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        fname = f.name

    # INITIAL PROGRESS SIGNAL
    print(json.dumps({"type": "start", "total": len(inputs)}), flush=True)

    results = []
    stopped_at = len(inputs)

    try:
        for i, input_data in enumerate(inputs):
            try:
                result = subprocess.run(
                    ["python3", fname],
                    input=input_data,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                
                passed = True
                error = None
                output = None

                # Returncode check (Comp / Runtime Error)
                if result.returncode != 0:
                    passed = False
                    error = result.stderr.strip() or "Standard Error captured"
                else:
                    output = result.stdout.strip()

                if passed:
                    results.append({"output": output})
                    # STREAMING PROGRESS
                    print(json.dumps({"type": "progress", "index": i, "passed": True}), flush=True)
                else:
                    results.append({"error": error})
                    # STREAMING PROGRESS (FAILED CASE)
                    print(json.dumps({"type": "progress", "index": i, "passed": False, "error": error}), flush=True)
                    stopped_at = i
                    if early_exit:
                        break
            except subprocess.TimeoutExpired:
                results.append({"error": "Time Limit Exceeded (8s)"})
                print(json.dumps({"type": "progress", "index": i, "passed": False, "error": "Time Limit Exceeded"}), flush=True)
                stopped_at = i
                if early_exit:
                    break
    except Exception as e:
        results.append({"error": str(e)})
        stopped_at = 0
    finally:
        try:
            os.unlink(fname)
        except Exception:
            pass

    return {"type": "finished", "results": results, "stopped_at": stopped_at}


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        job = json.loads(line)
        result = handle_job(job)
    except Exception as e:
        result = {"type": "finished", "results": [{"error": str(e)}], "stopped_at": 0}
    print(json.dumps(result), flush=True)
