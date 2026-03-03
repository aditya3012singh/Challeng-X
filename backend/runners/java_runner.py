"""
Warm container runner for Java submissions — BATCHED protocol.
Compiles ONCE, then runs each test case input against the same Main.class in parallel using multiprocessing.
"""
import sys
import json
import subprocess
import os
from multiprocessing import Pool, cpu_count

def run_test_case(args):
    """Worker function to run a single compiled Java class."""
    i, input_data = args
    try:
        # Run the compiled Main class
        # -- Limit max heap size to prevent OOM across concurrent JVMs
        result = subprocess.run(
            ["java", "-Xmx64m", "Main"], 
            input=input_data,
            capture_output=True,
            text=True,
            timeout=2.0
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
            "error": "Time Limit Exceeded (2s)"
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

    source_file = "Main.java"
    with open(source_file, "w", encoding="utf-8") as f:
        f.write(code)

    try:
        # 1. Compile ONCE
        compile_process = subprocess.run(
            ["javac", source_file],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile_process.returncode != 0:
            err = compile_process.stderr.strip() or "Standard error captured"
            return {"type": "finished", "results": [{"error": f"Compilation Error:\n{err}"}], "stopped_at": 0}

        # INITIAL PROGRESS SIGNAL
        print(json.dumps({"type": "start", "total": len(inputs)}), flush=True)

        results = [None] * len(inputs)
        stopped_at = len(inputs)
        passed_count = 0
        
        # Determine strict bounded pool size (Java is heavy, so we limit to 3-4 concurrent JVMs inside a 256MB boundary)
        num_workers = min(cpu_count() or 4, 4)

        # 2. Run each test case against the compiled class in parallel
        # We use imap (ordered) so we can break early and stop the pool immediately on failure
        with Pool(processes=num_workers) as pool:
            worker_args = [(i, input_data) for i, input_data in enumerate(inputs)]
            
            for res in pool.imap(run_test_case, worker_args):
                idx = res["index"]
                results[idx] = res
                
                if res["passed"]:
                    passed_count += 1
                    print(json.dumps({
                        "type": "progress", 
                        "index": idx, 
                        "passed": passed_count, 
                        "output": res["output"]
                    }), flush=True)
                else:
                    print(json.dumps({
                        "type": "progress", 
                        "index": idx, 
                        "passed": passed_count, 
                        "error": res["error"]
                    }), flush=True)
                    stopped_at = idx
                    if early_exit:
                        break # 🛑 STOP THE POOL IMMEDIATELY

        # If early_exit was triggered, truncate results
        if early_exit and stopped_at < len(inputs):
            results = results[:stopped_at + 1]

    except subprocess.TimeoutExpired:
        return {"type": "finished", "results": [{"error": "Compilation Time Limit Exceeded (10s)"}], "stopped_at": 0}
    except Exception as e:
        return {"type": "finished", "results": [{"error": str(e)}], "stopped_at": 0}
    finally:
        try: os.unlink(source_file)
        except Exception: pass
        try: os.unlink("Main.class")
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


def run_java():
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

if __name__ == "__main__":
    run_java()
