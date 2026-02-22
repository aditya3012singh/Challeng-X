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

def handle_job(job):
    code = job.get("code", "")
    inputs = job.get("inputs", [])
    early_exit = job.get("early_exit", True)

    with tempfile.NamedTemporaryFile(mode="w", suffix=".cpp", delete=False) as f:
        f.write(code)
        src = f.name

    # Strip .cpp -> executable path
    exe = src[:-4]
    results = []
    stopped_at = len(inputs)

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

        # ── Run each test case against the compiled binary ────────────────────
        for i, input_data in enumerate(inputs):
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

    except subprocess.TimeoutExpired:
        return {"type": "finished", "results": [{"error": "Compilation Time Limit Exceeded (15s)"}], "stopped_at": 0}
    except Exception as e:
        return {"type": "finished", "results": [{"error": str(e)}], "stopped_at": 0}
    finally:
        try: os.unlink(src)
        except Exception: pass
        try: os.unlink(exe)
        except Exception: pass

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
