"""
Warm container runner for C++ submissions — BATCHED protocol.
Compiles ONCE, then runs each test case input against the same binary.

Input:  {"code": "...", "inputs": ["input1", "input2", ...], "early_exit": true}\n
Output: {"results": [{"output":"..."}, {"error":"..."}], "stopped_at": 0}\n
"""
import sys
import json
import subprocess
import tempfile
import os

from multiprocessing import Pool, cpu_count

def run_test_case(args):
    """Worker function to run a single compiled binary."""
    i, input_data, exe = args
    try:
        result = subprocess.run(
            [exe],
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
            error = result.stderr.strip() or "Standard error captured"
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

    with tempfile.NamedTemporaryFile(mode="w", suffix=".cpp", delete=False) as f:
        f.write(code)
        src = f.name

    # Strip .cpp -> executable path
    exe = src[:-4]
    
    try:
        # ── Compile ONCE ──────────────────────────────────────────────────────
        comp = subprocess.run(
            ["g++", src, "-o", exe, "-std=c++17", "-O0", "-pipe"],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if comp.returncode != 0:
            err = comp.stderr.strip() or "Standard error captured"
            return {"type": "finished", "results": [{"error": f"Compilation Error:\n{err}"}], "stopped_at": 0}

        # INITIAL PROGRESS SIGNAL
        print(json.dumps({"type": "start", "total": len(inputs)}), flush=True)

        results = [None] * len(inputs)
        stopped_at = len(inputs)
        passed_count = 0
        num_workers = min(cpu_count() or 4, 8)

        # ── Run each test case against the compiled binary in parallel ────────
        # We use imap (ordered) so we can break early and stop the pool immediately on failure
        with Pool(processes=num_workers) as pool:
            worker_args = [(i, input_data, exe) for i, input_data in enumerate(inputs)]
            
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

    except subprocess.TimeoutExpired:
        return {"type": "finished", "results": [{"error": "Compilation Time Limit Exceeded (15s)"}], "stopped_at": 0}
    except Exception as e:
        return {"type": "finished", "results": [{"error": str(e)}], "stopped_at": 0}
    finally:
        try: os.unlink(src)
        except Exception: pass
        try: os.unlink(exe)
        except Exception: pass

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
