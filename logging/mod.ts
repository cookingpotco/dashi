const LEVELS = ["debug", "info", "warn", "error"] as const;
type Level = (typeof LEVELS)[number];

const env = Deno.env.get("DASHI_LOG");
const min = LEVELS.indexOf(
  env === "debug" || env === "info" || env === "warn" || env === "error"
    ? env
    : "info",
);

function enabled(level: Level): boolean {
  return LEVELS.indexOf(level) >= min;
}

export function debug(...data: unknown[]): void {
  if (enabled("debug")) {
    console.debug(...data);
  }
}

export function info(...data: unknown[]): void {
  if (enabled("info")) {
    console.info(...data);
  }
}

export function warn(...data: unknown[]): void {
  if (enabled("warn")) {
    console.warn(...data);
  }
}

export function error(...data: unknown[]): void {
  if (enabled("error")) {
    console.error(...data);
  }
}
