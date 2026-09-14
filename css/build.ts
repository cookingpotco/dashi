/** Options for {@linkcode buildCss}. */
export interface BuildCssOptions {
  /** App root directory containing `styles.css`. */
  root: string;
  /** Rebuild on Tailwind output changes. */
  watch?: boolean;
  /** Aborts watch mode when signaled. */
  signal?: AbortSignal;
}

function spawnTailwind(
  root: string,
  source: string,
  outPath: string,
  watch: boolean,
): Deno.ChildProcess {
  const args = ["run", "-A"];
  if (watch) {
    args.push("--allow-scripts=npm:@parcel/watcher");
  }
  args.push(
    "npm:@tailwindcss/cli@4",
    "-i",
    source,
    "-o",
    outPath,
  );
  if (watch) {
    args.push("--watch", "--poll");
  }
  return new Deno.Command(Deno.execPath(), {
    args,
    stdout: "inherit",
    stderr: "inherit",
    cwd: root,
  }).spawn();
}

async function hashCss(bytes: Uint8Array): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new Uint8Array(bytes)),
  );
  let binary = "";
  for (const byte of digest) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_")
    .replaceAll("=", "");
}

function manifestHrefValue(parsed: unknown, manifest: string): string {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Invalid ${manifest}`);
  }
  const href = Reflect.get(parsed, "href");
  if (typeof href !== "string") {
    throw new Error(`Invalid ${manifest}`);
  }
  return href;
}

async function readPreviousHref(manifest: string): Promise<string | undefined> {
  try {
    const text = await Deno.readTextFile(manifest);
    return manifestHrefValue(JSON.parse(text), manifest);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return undefined;
    }
    throw error;
  }
}

async function fingerprint(
  cssPath: string,
  options: {
    watch: boolean;
    generatedDir: string;
    manifest: string;
  },
): Promise<void> {
  const bytes = await Deno.readFile(cssPath);
  if (bytes.length === 0) {
    return;
  }
  const hash = await hashCss(bytes);
  const name = `styles-${hash}.css`;
  const href = `/generated/${name}`;
  const previousHref = await readPreviousHref(options.manifest);
  await Deno.mkdir(options.generatedDir, { recursive: true });
  await Deno.writeFile(`${options.generatedDir}/${name}`, bytes);
  await Deno.writeTextFile(
    options.manifest,
    `${JSON.stringify({ href }, null, 2)}\n`,
  );
  const keep = new Set([name]);
  if (
    options.watch &&
    previousHref !== undefined &&
    previousHref !== href
  ) {
    keep.add(previousHref.replace(/^\/generated\//, ""));
  }
  for await (const entry of Deno.readDir(options.generatedDir)) {
    if (
      entry.isFile &&
      entry.name.startsWith("styles-") &&
      entry.name.endsWith(".css") &&
      !keep.has(entry.name)
    ) {
      await Deno.remove(`${options.generatedDir}/${entry.name}`);
    }
  }
  if (options.watch && previousHref !== href) {
    console.log(`[css] ${href}`);
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

/**
 * Runs the Tailwind CLI and writes a fingerprinted stylesheet manifest.
 *
 * @see https://dashi.run/docs/styling#buildcss
 */
export async function buildCss(options: BuildCssOptions): Promise<void> {
  throwIfAborted(options.signal);
  const root = options.root;
  const watch = options.watch === true;
  const source = `${root}/styles.css`;
  const generatedDir = `${root}/generated`;
  const manifest = `${root}/styles.json`;
  const tempDir = await Deno.makeTempDir({ prefix: "dashi-styles-" });
  const outPath = `${tempDir}/styles.css`;

  if (!watch) {
    const child = spawnTailwind(root, source, outPath, false);
    const status = await child.status;
    if (!status.success) {
      throw new Error(`Tailwind CLI exited with code ${status.code}`);
    }
    try {
      await fingerprint(outPath, { watch: false, generatedDir, manifest });
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
    return;
  }

  const watcher = Deno.watchFs(tempDir);
  const tailwind = { child: spawnTailwind(root, source, outPath, true) };
  const signal = options.signal;

  async function maybeFingerprint(): Promise<void> {
    try {
      await fingerprint(outPath, { watch: true, generatedDir, manifest });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return;
      }
      throw error;
    }
  }

  async function cleanup(): Promise<void> {
    try {
      tailwind.child.kill();
    } catch {
      // already exited
    }
    try {
      watcher.close();
    } catch {
      // already closed
    }
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch {
      // already removed
    }
  }

  function abortError(): DOMException {
    return new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      void cleanup().then(() => reject(error));
    };

    if (signal?.aborted) {
      fail(abortError());
      return;
    }

    signal?.addEventListener("abort", () => {
      fail(abortError());
    }, { once: true });

    const superviseChild = async (): Promise<void> => {
      while (!signal?.aborted) {
        const status = await tailwind.child.status;
        if (signal?.aborted) {
          return;
        }
        if (!status.success) {
          fail(new Error(`Tailwind CLI exited with code ${status.code}`));
          return;
        }
        tailwind.child = spawnTailwind(root, source, outPath, true);
      }
    };
    void superviseChild();

    void (async () => {
      try {
        const initialDeadline = Date.now() + 30_000;
        while (Date.now() < initialDeadline) {
          if (signal?.aborted) {
            fail(abortError());
            return;
          }
          try {
            await Deno.stat(outPath);
            await maybeFingerprint();
            break;
          } catch (error) {
            if (!(error instanceof Deno.errors.NotFound)) {
              fail(error instanceof Error ? error : new Error(String(error)));
              return;
            }
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        for await (const event of watcher) {
          if (signal?.aborted) {
            fail(abortError());
            return;
          }
          if (event.kind === "access") {
            continue;
          }
          try {
            await maybeFingerprint();
          } catch (error) {
            fail(error instanceof Error ? error : new Error(String(error)));
            return;
          }
        }
        if (!settled) {
          settled = true;
          resolve();
        }
      } catch (error) {
        if (signal?.aborted) {
          fail(abortError());
          return;
        }
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    })();
  });
}
