import { spawn } from "node:child_process";

/**
 * Probes local Docker CLI and daemon version.
 * Returns null if docker is missing or daemon is unreachable.
 * @returns {Promise<string|null>}
 */
export async function getDockerVersion() {
  return new Promise((resolve) => {
    let output = "";
    let errOutput = "";

    try {
      const child = spawn("docker", ["version", "--format", "{{.Server.Version}}"]);

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        errOutput += data.toString();
      });

      child.on("error", () => {
        // Fallback: check if client version is at least runnable
        try {
          const clientChild = spawn("docker", ["--version"]);
          let cliOut = "";
          clientChild.stdout.on("data", (d) => {
            cliOut += d.toString();
          });
          clientChild.on("close", (code) => {
            if (code === 0 && cliOut.trim()) {
              resolve(cliOut.trim());
            } else {
              resolve(null);
            }
          });
          clientChild.on("error", () => resolve(null));
        } catch {
          resolve(null);
        }
      });

      child.on("close", (code) => {
        if (code === 0 && output.trim()) {
          resolve(output.trim());
        } else {
          // If server daemon not running, check client --version
          try {
            const clientChild = spawn("docker", ["--version"]);
            let cliOut = "";
            clientChild.stdout.on("data", (d) => {
              cliOut += d.toString();
            });
            clientChild.on("close", (c) => {
              if (c === 0 && cliOut.trim()) {
                resolve(`${cliOut.trim()} (daemon stopped)`);
              } else {
                resolve(null);
              }
            });
            clientChild.on("error", () => resolve(null));
          } catch {
            resolve(null);
          }
        }
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Returns active sandbox runtime (e.g. gVisor runsc or runc)
 * @returns {string}
 */
export function getSandboxRuntime() {
  return process.env.SANDBOX_RUNTIME || "runc";
}

