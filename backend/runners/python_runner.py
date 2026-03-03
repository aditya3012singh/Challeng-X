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
from multiprocessing import Pool, cpu_count

def run_test_case(args):
    """Worker function to run a single test case."""
    i, input_data, fname = args
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

        if result.returncode != 0:
            passed = False
            error = result.stderr.strip() or "Standard Error captured"
        else:
            output = result.stdout.strip()

        return {
            "index": i,
            "passed": passed,
            "output": output,
            "error": error
        }
    except subprocess.TimeoutExpired:
        return {
            "index": i,
            "passed": False,
            "error": "Time Limit Exceeded (8s)"
        }
    except Exception as e:
        return {
            "index": i,
            "passed": False,
            "error": str(e)
        }

def handle_job(job):
    code = job.get("code", "")
    inputs = job.get("inputs", [])
    early_exit = job.get("early_exit", True)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        fname = f.name

    # INITIAL PROGRESS SIGNAL
    print(json.dumps({"type": "start", "total": len(inputs)}), flush=True)

    results = [None] * len(inputs)
    stopped_at = len(inputs)
    passed_count = 0

    # Limit concurrency to avoid resource exhaustion
    # Use min(cpu_count, 8) as a reasonable limit for these tiny tasks
    num_workers = min(cpu_count() or 4, 8)
    
    try:
        if early_exit:
            # For SUBMIT/Early Exit, we still want some parallelism but must respect the first failure
            # We can run in small batches or just accept that parallel might finish later indices first
            # To keep it simple and fast, we run all in parallel and then find the first failure
            # We use imap (ordered) so we can break early and stop the pool immediately on failure
            with Pool(processes=num_workers) as pool:
                worker_args = [(i, input_data, fname) for i, input_data in enumerate(inputs)]
                
                for res in pool.imap(run_test_case, worker_args):
                    idx = res["index"]
                    results[idx] = res
                    
                    if res["passed"]:
                        passed_count += 1
                        print(json.dumps({
                            "type": "progress", 
                            "index": idx, 
                            "passed": True, 
                            "passed_so_far": passed_count
                        }), flush=True)
                    else:
                        print(json.dumps({
                            "type": "progress", 
                            "index": idx, 
                            "passed": False, 
                            "error": res["error"],
                            "passed_so_far": passed_count
                        }), flush=True)
                        stopped_at = idx
                        if early_exit:
                            break # 🛑 STOP THE POOL IMMEDIATELY
                
                # If early_exit was triggered, truncate results
                if early_exit and stopped_at < len(inputs):
                    results = results[:stopped_at + 1]
        else:
            # RUN type (sequential or parallel, early_exit=False anyway)
            with Pool(processes=num_workers) as pool:
                worker_args = [(i, input_data, fname) for i, input_data in enumerate(inputs)]
                for res in pool.imap_unordered(run_test_case, worker_args):
                    idx = res["index"]
                    results[idx] = res
                    passed_count += 1 if res["passed"] else 0
                    print(json.dumps({
                        "type": "progress", 
                        "index": idx, 
                        "passed": res["passed"], 
                        "error": res.get("error"),
                        "passed_so_far": passed_count
                    }), flush=True)

    except Exception as e:
        results = [{"error": str(e)}]
        stopped_at = 0
    finally:
        try:
            os.unlink(fname)
        except Exception:
            pass

    # Format final results
    formatted_results = []
    for r in results:
        if r is None: continue
        if r["passed"]:
            formatted_results.append({"output": r["output"]})
        else:
            formatted_results.append({"error": r["error"]})

    return {"type": "finished", "results": formatted_results, "stopped_at": stopped_at}


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
