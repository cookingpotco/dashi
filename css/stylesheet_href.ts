function manifestHref(parsed: unknown, manifestPath: string): string {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Invalid ${manifestPath}`);
  }
  const href = Reflect.get(parsed, "href");
  if (typeof href !== "string") {
    throw new Error(`Invalid ${manifestPath}`);
  }
  return href;
}

/**
 * Reads the hashed stylesheet URL from `generated/styles.json` at request time.
 *
 * @param root App root directory containing `generated/styles.json`.
 * @see https://dashi.run/docs/styling#stylesheethref
 */
export function stylesheetHref(root: string): string {
  const manifestPath = `${root}/generated/styles.json`;
  let text: string;
  try {
    text = Deno.readTextFileSync(manifestPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        `${manifestPath} not found. Run \`deno task css\` first.`,
      );
    }
    throw error;
  }
  return manifestHref(JSON.parse(text), manifestPath);
}
