import { type Browser, launch, type Page } from "@astral/astral";
import { type App, boot } from "../test-harness/mod.ts";

export type { Browser, Page };
export type { App };
export { boot };

const RESULTS_DIR = new URL("./results/", import.meta.url);

export interface BrowserTest {
  app: App;
  page: Page;
  browser: Browser;
}

function fixtureSlug(mainPath: string | URL): string {
  const href = mainPath instanceof URL ? mainPath.href : mainPath;
  const dir = href.replace(/\/[^/]*$/, "");
  const name = dir.split("/").filter(Boolean).at(-1) ?? "fixture";
  return `${name}-${Date.now()}`;
}

async function formatE2eFailure(
  app: App,
  page: Page,
  slug: string,
): Promise<string> {
  await Deno.mkdir(RESULTS_DIR, { recursive: true });

  let html = "";
  try {
    html = await page.content();
  } catch (error) {
    html = `(failed to read page content: ${error})`;
  }

  let screenshotLine = "";
  try {
    const png = await page.screenshot();
    const screenshotPath = new URL(`${slug}.png`, RESULTS_DIR);
    await Deno.writeFile(screenshotPath, png);
    screenshotLine = `screenshot: ${screenshotPath.pathname}`;
  } catch (error) {
    screenshotLine = `screenshot: failed (${error})`;
  }

  const htmlPath = new URL(`${slug}.html`, RESULTS_DIR);
  const stderrPath = new URL(`${slug}.stderr.txt`, RESULTS_DIR);
  await Deno.writeTextFile(htmlPath, html);
  await Deno.writeTextFile(stderrPath, app.stderr);

  return [
    `E2E case failed`,
    `url: ${page.url}`,
    `html:\n${html}`,
    `stderr:\n${app.stderr}`,
    screenshotLine,
  ].join("\n");
}

/** Boot the fixture, launch Chromium, and run `fn`. Dumps DOM and stderr on failure. */
export async function withBrowser(
  mainPath: string | URL,
  fn: (t: BrowserTest) => Promise<void>,
): Promise<void> {
  await Deno.mkdir(RESULTS_DIR, { recursive: true });
  await using app = await boot(mainPath);
  const args: string[] = [];
  if (Deno.env.get("GITHUB_ACTIONS")) {
    args.push("--no-sandbox", "--disable-setuid-sandbox");
  }
  await using browser = await launch({
    headless: !Deno.env.get("DASHI_E2E_HEADED"),
    args,
  });
  await using page = await browser.newPage();
  try {
    await fn({ app, page, browser });
  } catch (error) {
    let dump = `stderr:\n${app.stderr}`;
    try {
      dump = await formatE2eFailure(app, page, fixtureSlug(mainPath));
    } catch {
      // Keep stderr if the dump itself fails.
    }
    if (error instanceof Error) {
      error.message = `${error.message}\n\n${dump}`;
    }
    throw error;
  }
}
