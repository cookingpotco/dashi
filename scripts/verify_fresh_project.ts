#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net
/**
 * Type-checks the README consumer in a temp directory.
 *
 * `--linked` resolves `jsr:@cookingpot/dashi@<version>` to this checkout
 * through `links`. `--registry` installs that version from JSR.
 *
 *   deno run -A scripts/verify_fresh_project.ts --linked
 *   deno run -A scripts/verify_fresh_project.ts --registry
 */

import denoJson from "../deno.json" with { type: "json" };

const MAIN_TSX = `import { serve } from "dashi";

serve(({ route }) => ({
  routes: [
    route("/", {
      GET: () => <h1>Hello</h1>,
    }),
  ],
}));
`;

const enum Mode {
  Linked = "linked",
  Registry = "registry",
}

interface ConsumerConfig {
  compilerOptions: {
    jsx: string;
    jsxImportSource: string;
  };
  unstable: string[];
  imports: Record<string, string>;
  links?: string[];
}

function parseMode(args: string[]): Mode {
  const linked = args.includes("--linked");
  const registry = args.includes("--registry");
  if (linked === registry) {
    throw new Error("pass exactly one of --linked or --registry");
  }
  return linked ? Mode.Linked : Mode.Registry;
}

function consumerConfig(
  name: string,
  version: string,
  checkout: string | undefined,
): ConsumerConfig {
  const config: ConsumerConfig = {
    compilerOptions: {
      jsx: "precompile",
      jsxImportSource: "dashi",
    },
    unstable: ["bundle"],
    imports: {
      dashi: `jsr:${name}@${version}`,
    },
  };
  if (checkout !== undefined) {
    config.links = [checkout];
  }
  return config;
}

async function checkConsumer(cwd: string): Promise<void> {
  const output = await new Deno.Command(Deno.execPath(), {
    args: ["check", "main.tsx"],
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  }).output();
  if (output.code !== 0) {
    throw new Error(`deno check failed with code ${output.code}`);
  }
}

async function main(): Promise<void> {
  const mode = parseMode(Deno.args);
  const root = Deno.realPathSync(`${import.meta.dirname}/..`);
  const { name, version } = denoJson;
  const dir = await Deno.makeTempDir({ prefix: "dashi-fresh-" });
  if (dir === root || dir.startsWith(`${root}/`)) {
    throw new Error(`temp dir ${dir} is inside the checkout`);
  }

  let passed = false;
  try {
    const config = consumerConfig(
      name,
      version,
      mode === Mode.Linked ? root : undefined,
    );
    await Deno.writeTextFile(
      `${dir}/deno.json`,
      `${JSON.stringify(config, null, 2)}\n`,
    );
    await Deno.writeTextFile(`${dir}/main.tsx`, MAIN_TSX);
    console.log(`${mode} consumer at ${dir} using ${name}@${version}`);
    await checkConsumer(dir);
    passed = true;
  } finally {
    if (passed) {
      await Deno.remove(dir, { recursive: true });
    } else {
      console.error(`consumer left at ${dir}`);
    }
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    Deno.exit(1);
  }
}
