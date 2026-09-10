const ROOT = import.meta.dirname;

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

const css = spawn(["run", "-A", `${ROOT}/css.ts`, "--watch"]);
let cssStatus: Deno.CommandStatus | undefined;
void css.status.then((status) => {
  cssStatus = status;
});

while (true) {
  try {
    await Deno.stat(`${ROOT}/styles.json`);
    break;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
  if (cssStatus !== undefined) {
    Deno.exit(cssStatus.success ? 1 : cssStatus.code);
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
}

const server = spawn(["run", "-A", "--watch", `${ROOT}/main.ts`], {
  DASHI_MINIFY_CLIENT: "0",
});

function stop() {
  try {
    css.kill();
  } catch {
    // already exited
  }
  try {
    server.kill();
  } catch {
    // already exited
  }
}

Deno.addSignalListener("SIGINT", stop);
Deno.addSignalListener("SIGTERM", stop);

void css.status.then((status) => {
  if (!status.success) {
    stop();
    Deno.exit(status.code);
  }
});

const status = await server.status;
stop();
Deno.exit(status.code);
