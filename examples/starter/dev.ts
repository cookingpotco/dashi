// Waits for generated/styles.json, runs buildCss in watch mode, then starts the app.
import { buildCss } from "@cookingpot/dashi-css";

if (import.meta.dirname === undefined) {
  throw new Error("import.meta.dirname is required");
}
const ROOT = import.meta.dirname;
const MANIFEST = `${ROOT}/generated/styles.json`;
const ac = new AbortController();
const proc: { server?: Deno.ChildProcess } = {};

function spawn(
  args: string[],
  extraEnv?: Record<string, string>,
): Deno.ChildProcess {
  return new Deno.Command(Deno.execPath(), {
    args,
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
    env: extraEnv === undefined
      ? undefined
      : { ...Deno.env.toObject(), ...extraEnv },
  }).spawn();
}

function stop() {
  ac.abort();
  try {
    proc.server?.kill();
  } catch {
    // already exited
  }
}

let buildFailed = false;
void buildCss({ root: ROOT, watch: true, signal: ac.signal }).then(
  () => {},
  (error) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    buildFailed = true;
    stop();
    if (error instanceof Error) {
      const match = error.message.match(/exited with code (\d+)/);
      if (match !== null) {
        Deno.exit(Number(match[1]));
      }
    }
    Deno.exit(1);
  },
);

while (true) {
  if (buildFailed) {
    Deno.exit(1);
  }
  try {
    await Deno.stat(MANIFEST);
    break;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
}

proc.server = spawn([
  "run",
  "-A",
  "--watch",
  "main.ts",
  "--watch",
  "generated/styles.json",
  "main.ts",
], {
  DASHI_MINIFY_CLIENT: "0",
});

Deno.addSignalListener("SIGINT", stop);
Deno.addSignalListener("SIGTERM", stop);

const status = await proc.server.status;
stop();
Deno.exit(status.code);
