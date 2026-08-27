import { assert, assertEquals } from "@std/assert";
import { Logger } from "./mod.ts";

const ISO_LEN = 24;

function capture(
  method: "debug" | "info" | "warn" | "error",
  run: () => void,
): unknown[][] {
  const calls: unknown[][] = [];
  const original = console[method];
  console[method] = (...args: unknown[]) => {
    calls.push(args);
  };
  try {
    run();
  } finally {
    console[method] = original;
  }
  return calls;
}

function loggedLine(calls: unknown[][]): string {
  assertEquals(calls.length, 1);
  assertEquals(calls[0].length, 1);
  const line = calls[0][0];
  assert(typeof line === "string");
  return line;
}

function assertLogLine(line: string, afterStamp: string): void {
  assertEquals(line.includes("\n"), false);
  const stamp = line.slice(0, ISO_LEN);
  assertEquals(new Date(stamp).toISOString(), stamp);
  assertEquals(line.slice(ISO_LEN), afterStamp);
}

Deno.test("Logger.error flattens an Error cause onto one line", () => {
  const thrown = new Error("boom");
  thrown.stack =
    "TypeError: boom\n    at recover (ssr/mod.ts:214:3)\n    at handle (pipeline.ts:524:9)";
  const calls = capture("error", () => {
    Logger.error(["ssr"], "render recovering from", thrown);
  });
  assertLogLine(
    loggedLine(calls),
    " ERROR [ssr] render recovering from: TypeError: boom at recover (ssr/mod.ts:214:3) at handle (pipeline.ts:524:9)",
  );
});

Deno.test("Logger.info without cause has no trailing colon", () => {
  const calls = capture("info", () => {
    Logger.info(["route"], "GET /");
  });
  assertLogLine(loggedLine(calls), " INFO [route] GET /");
});

Deno.test("Logger.error stringifies a non-Error cause", () => {
  const calls = capture("error", () => {
    Logger.error(["static"], "directory not found", 404);
  });
  assertLogLine(loggedLine(calls), " ERROR [static] directory not found: 404");
});

Deno.test("several labels appear in order", () => {
  const calls = capture("error", () => {
    Logger.error(["ssr", "recover"], "render recovering from");
  });
  assertLogLine(
    loggedLine(calls),
    " ERROR [ssr] [recover] render recovering from",
  );
});

Deno.test("Logger.debug is silent at default DASHI_LOG", () => {
  const calls = capture("debug", () => {
    Logger.debug(["ssr"], "not emitted");
  });
  assertEquals(calls, []);
});
