"""
Warm container runner for C submissions — BATCHED protocol.
Compiles ONCE with gcc, then runs each test case input against the same binary.

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

    with tempfile.NamedTemporaryFile(mode="w", suffix=".c", delete=False) as f:
        f.write(code)
        src = f.name

    exe = src[:-2]  # strip .c
    results = []
    stopped_at = len(inputs)

    try:
        # ── Compile ONCE ──────────────────────────────────────────────────────
        comp = subprocess.run(
            ["gcc", src, "-o", exe, "-lm", "-O0", "-pipe"],
            capture_output=True,
            text=True,
            timeout=15,
        )
        if comp.returncode != 0:
            err = comp.stderr.strip()
            return {"results": [{"error": f"Compilation Error:\n{err}"}], "stopped_at": 0}

        # ── Run each test case ────────────────────────────────────────────────
        for i, input_data in enumerate(inputs):
            try:
                result = subprocess.run(
                    [exe],
                    input=input_data,
                    capture_output=True,
                    text=True,
                    timeout=8,
                )
                if result.returncode != 0 and result.stderr:
                    results.append({"error": result.stderr.strip()})
                    stopped_at = i
                    if early_exit:
                        break
                else:
                    results.append({"output": result.stdout.strip()})
            except subprocess.TimeoutExpired:
                results.append({"error": "Time Limit Exceeded (8s)"})
                stopped_at = i
                if early_exit:
                    break

    except subprocess.TimeoutExpired:
        return {"results": [{"error": "Compilation Time Limit Exceeded (15s)"}], "stopped_at": 0}
    except Exception as e:
        return {"results": [{"error": str(e)}], "stopped_at": 0}
    finally:
        try: os.unlink(src)
        except Exception: pass
        try: os.unlink(exe)
        except Exception: pass

    return {"results": results, "stopped_at": stopped_at}


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        job = json.loads(line)
        result = handle_job(job)
    except Exception as e:
        result = {"results": [{"error": str(e)}], "stopped_at": 0}
    print(json.dumps(result), flush=True)
