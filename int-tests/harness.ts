export { App, type AppRequest, boot } from "../test-harness/mod.ts";
import { type App, type AppRequest } from "../test-harness/mod.ts";

export function formatIntegrationFailure(
  app: App,
  request: AppRequest,
  res: Response,
  body: string,
): string {
  const headers = [...res.headers.entries()]
    .map(([name, value]) => `  ${name}: ${value}`)
    .join("\n");
  return [
    `Integration case failed for ${request.method ?? "GET"} ${request.path}`,
    `status: ${res.status}`,
    `headers:\n${headers}`,
    `body:\n${body}`,
    `stderr:\n${app.stderr}`,
  ].join("\n");
}
