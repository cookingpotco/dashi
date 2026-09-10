import { assertEquals, assertMatch, assertNotEquals } from "@std/assert";

const CREATE = `${import.meta.dirname}/../create/mod.ts`;
const BOOT_TIMEOUT_MS = 15_000;

async function runCreate(dest: string, args: string[] = []): Promise<number> {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", CREATE, dest, ...args],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { code } = await cmd.output();
  return code;
}

function drain(stream: ReadableStream<Uint8Array> | null): void {
  if (stream === null) {
    return;
  }
  void (async () => {
    const reader = stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) {
        break;
      }
    }
  })();
}

async function waitForOk(
  port: number,
  path: string,
  child: Deno.ChildProcess,
): Promise<void> {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${path}`);
      if (res.ok) {
        await res.text();
        return;
      }
    } catch {
      // not ready yet
    }
    const earlyExit = await Promise.race([
      child.status,
      new Promise<null>((resolve) => setTimeout(resolve, 50, null)),
    ]);
    if (earlyExit !== null && !earlyExit.success) {
      throw new Error(`server exited with code ${earlyExit.code}`);
    }
  }
  throw new Error(`timed out waiting for GET ${path} on port ${port}`);
}

async function firstStaticFile(staticDir: string): Promise<string> {
  for await (const entry of Deno.readDir(staticDir)) {
    if (entry.isFile) {
      return entry.name;
    }
  }
  throw new Error(`no files in ${staticDir}`);
}

Deno.test("deno create scaffolds a runnable app", async (t) => {
  const parent = await Deno.makeTempDir({ prefix: "dashi-create-" });
  const dest = `${parent}/app`;

  await t.step("create exits zero into an empty directory", async () => {
    assertEquals(await runCreate(dest), 0);
    await Deno.stat(`${dest}/deno.json`);
    await Deno.stat(`${dest}/main.ts`);
  });

  await t.step("generated app builds and type-checks", async () => {
    const css = new Deno.Command(Deno.execPath(), {
      args: ["task", "css"],
      cwd: dest,
      stdout: "inherit",
      stderr: "inherit",
    });
    assertEquals((await css.output()).code, 0);
    await Deno.stat(`${dest}/styles.json`);

    const check = new Deno.Command(Deno.execPath(), {
      args: ["check", "--min-dep-age=0", "main.ts"],
      cwd: dest,
      stdout: "inherit",
      stderr: "inherit",
    });
    assertEquals((await check.output()).code, 0);
  });

  await t.step("serves the document and asset routes", async () => {
    const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
    const port = listener.addr.port;
    listener.close();

    const child = new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", "--min-dep-age=0", "main.ts"],
      cwd: dest,
      env: {
        ...Deno.env.toObject(),
        PORT: String(port),
        DASHI_MINIFY_CLIENT: "0",
      },
      stdout: "piped",
      stderr: "piped",
    }).spawn();

    drain(child.stdout);
    drain(child.stderr);
    try {
      await waitForOk(port, "/", child);

      const home = await fetch(`http://127.0.0.1:${port}/`);
      const homeBody = await home.text();
      assertEquals(home.status, 200);
      assertMatch(home.headers.get("content-type") ?? "", /^text\/html/);
      if (homeBody.length === 0) {
        throw new Error("empty document body");
      }

      const manifest = JSON.parse(
        await Deno.readTextFile(`${dest}/styles.json`),
      ) as { href: string };
      const generated = await fetch(
        `http://127.0.0.1:${port}${manifest.href}`,
      );
      const generatedBody = await generated.text();
      assertEquals(generated.status, 200);
      assertMatch(generated.headers.get("content-type") ?? "", /^text\/css/);
      assertMatch(
        generated.headers.get("cache-control") ?? "",
        /immutable/,
      );
      if (generatedBody.length === 0) {
        throw new Error("empty generated stylesheet");
      }

      const staticFile = await firstStaticFile(`${dest}/static`);
      const asset = await fetch(
        `http://127.0.0.1:${port}/static/${staticFile}`,
      );
      const assetBody = await asset.text();
      assertEquals(asset.status, 200);
      assertMatch(asset.headers.get("cache-control") ?? "", /immutable/);
      if (assetBody.length === 0) {
        throw new Error("empty static file body");
      }
    } finally {
      try {
        child.kill("SIGTERM");
      } catch {
        // already exited
      }
      await child.status;
    }
  });

  await Deno.remove(parent, { recursive: true });
});

Deno.test("create refuses a non-empty directory without --force", async () => {
  const dir = await Deno.makeTempDir({ prefix: "dashi-create-block-" });
  await Deno.writeTextFile(`${dir}/keep.txt`, "stay\n");
  assertNotEquals(await runCreate(dir), 0);
  await Deno.remove(dir, { recursive: true });
});
