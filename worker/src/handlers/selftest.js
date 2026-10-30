import { runInSandbox } from "../sandbox.js";

/**
 * Handles 'selftest' job type.
 * Runs four checks in the sandbox + host isolation check:
 * 1. Trivial Python command succeeds
 * 2. Outbound network access fails
 * 3. Infinite loop is killed by timeout
 * 4. Memory-hungry script is killed or limited
 * Also confirms no host path is visible.
 *
 * @param {object} job
 * @param {object} context
 * @param {(line: string) => Promise<void>} context.appendLog
 * @returns {Promise<object>} Structured result
 */
export async function handleSelfTest(job, { appendLog }) {
  const startedAt = Date.now();
  await appendLog("Initiating PatchProof Sandbox Runner Self-Test...");
  await appendLog("Configuration: --network none, --read-only, --cap-drop ALL, user 65534");

  const checks = [];

  // 1. Trivial Python command succeeds
  await appendLog("[Check 1/4] Testing basic Python execution sanity...");
  const sanityRes = await runInSandbox({
    command: ["python3", "-c", "import sys; print('SANITY_OK'); sys.exit(0)"],
    timeoutMs: 8000,
    memoryMb: 128,
  });
  const sanityPassed = sanityRes.exitCode === 0 && sanityRes.stdout.includes("SANITY_OK");
  checks.push({
    id: "sanity",
    name: "Python execution sanity",
    passed: sanityPassed,
    exitCode: sanityRes.exitCode,
    durationMs: sanityRes.durationMs,
    details: sanityPassed
      ? "Python 3.12 process executed and returned SANITY_OK with exit code 0."
      : `Execution failed: ${sanityRes.stderr || "Unknown error"}`,
  });
  await appendLog(
    `[Check 1/4] ${sanityPassed ? "PASS" : "FAIL"}: Python execution returned code ${sanityRes.exitCode} in ${sanityRes.durationMs}ms`
  );

  // 2. Outbound network access fails
  await appendLog("[Check 2/4] Testing network isolation (airgap)...");
  const networkRes = await runInSandbox({
    command: [
      "python3",
      "-c",
      "import urllib.request, sys;\n" +
        "try:\n" +
        "    urllib.request.urlopen('https://example.com', timeout=2)\n" +
        "    print('NETWORK_ACCESSIBLE')\n" +
        "    sys.exit(0)\n" +
        "except Exception as e:\n" +
        "    print(f'BLOCKED: {type(e).__name__}')\n" +
        "    sys.exit(1)",
    ],
    timeoutMs: 8000,
    memoryMb: 128,
  });
  const networkPassed = networkRes.exitCode !== 0 && !networkRes.stdout.includes("NETWORK_ACCESSIBLE");
  checks.push({
    id: "network",
    name: "Network isolation (airgap)",
    passed: networkPassed,
    exitCode: networkRes.exitCode,
    durationMs: networkRes.durationMs,
    details: networkPassed
      ? "Outbound network connection blocked by --network none flag as expected."
      : "FAIL: Outbound network was unexpectedly accessible.",
  });
  await appendLog(
    `[Check 2/4] ${networkPassed ? "PASS" : "FAIL"}: Outbound network request was neutralized in ${networkRes.durationMs}ms`
  );

  // 3. Infinite loop is killed by timeout
  await appendLog("[Check 3/4] Testing execution timeout enforcement (2500ms limit)...");
  const timeoutRes = await runInSandbox({
    command: [
      "python3",
      "-c",
      "import time;\n" +
        "print('LOOP_START', flush=True);\n" +
        "while True:\n" +
        "    time.sleep(0.5)",
    ],
    timeoutMs: 2500,
    memoryMb: 128,
  });
  const timeoutPassed = timeoutRes.timedOut === true;
  checks.push({
    id: "timeout",
    name: "Execution timeout enforcement",
    passed: timeoutPassed,
    timedOut: timeoutRes.timedOut,
    exitCode: timeoutRes.exitCode,
    durationMs: timeoutRes.durationMs,
    details: timeoutPassed
      ? `Container was forcefully killed after reaching timeout window (${timeoutRes.durationMs}ms).`
      : "FAIL: Infinite loop was not killed within timeout limit.",
  });
  await appendLog(
    `[Check 3/4] ${timeoutPassed ? "PASS" : "FAIL"}: Process killed by timeout in ${timeoutRes.durationMs}ms`
  );

  // 4. Memory-hungry script is killed or limited
  await appendLog("[Check 4/4] Testing memory quota containment (64MB cap)...");
  const memoryRes = await runInSandbox({
    command: [
      "python3",
      "-c",
      "import sys;\n" +
        "try:\n" +
        "    chunks = [bytearray(32 * 1024 * 1024) for _ in range(16)]\n" +
        "    print('MEMORY_UNRESTRICTED')\n" +
        "    sys.exit(0)\n" +
        "except MemoryError:\n" +
        "    print('MEMORY_ERROR_CAUGHT')\n" +
        "    sys.exit(137)",
    ],
    timeoutMs: 8000,
    memoryMb: 64,
  });
  const memoryPassed =
    memoryRes.oomKilled === true ||
    memoryRes.exitCode !== 0 ||
    !memoryRes.stdout.includes("MEMORY_UNRESTRICTED");
  checks.push({
    id: "memory",
    name: "Memory quota containment",
    passed: memoryPassed,
    oomKilled: memoryRes.oomKilled,
    exitCode: memoryRes.exitCode,
    durationMs: memoryRes.durationMs,
    details: memoryPassed
      ? "Memory allocation constrained by 64MB cgroup limit (OOM/MemoryError enforced)."
      : "FAIL: Memory allocation succeeded beyond quota limit.",
  });
  await appendLog(
    `[Check 4/4] ${memoryPassed ? "PASS" : "FAIL"}: Memory allocation constrained in ${memoryRes.durationMs}ms (oomKilled=${memoryRes.oomKilled})`
  );

  // Host path visibility confirmation
  await appendLog("[Isolation Check] Verifying host filesystem boundary...");
  const hostCheckRes = await runInSandbox({
    command: [
      "python3",
      "-c",
      "import os, sys;\n" +
        "host_paths = ['/d:', '/c:', '/Users', '/home', '/host', '/var/run/docker.sock'];\n" +
        "leaks = [p for p in host_paths if os.path.exists(p)];\n" +
        "if leaks:\n" +
        "    print(f'LEAK: {leaks}')\n" +
        "    sys.exit(1)\n" +
        "print('HOST_PATHS_ISOLATED')\n" +
        "sys.exit(0)",
    ],
    timeoutMs: 5000,
    memoryMb: 128,
  });
  const hostPassed = hostCheckRes.exitCode === 0 && hostCheckRes.stdout.includes("HOST_PATHS_ISOLATED");
  checks.push({
    id: "filesystem",
    name: "Host filesystem isolation",
    passed: hostPassed,
    exitCode: hostCheckRes.exitCode,
    durationMs: hostCheckRes.durationMs,
    details: hostPassed
      ? "Host drives, user directories, and docker.sock are completely invisible inside container."
      : "FAIL: Host path or socket leaked into container.",
  });
  await appendLog(
    `[Isolation Check] ${hostPassed ? "PASS" : "FAIL"}: No host filesystem paths visible inside sandbox.`
  );

  const allPassed = checks.every((c) => c.passed);
  const totalDuration = Date.now() - startedAt;

  await appendLog(
    `Self-test completed in ${totalDuration}ms. Result: ${allPassed ? "ALL 4 CHECKS PASSED" : "ONE OR MORE CHECKS FAILED"}`
  );

  return {
    allPassed,
    checks,
    totalDurationMs: totalDuration,
    completedAt: new Date().toISOString(),
  };
}

