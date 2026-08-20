const enum Level {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}

const LEVELS = [Level.Debug, Level.Info, Level.Warn, Level.Error];

const env = Deno.env.get("DASHI_LOG");
const min = LEVELS.indexOf(
  env === Level.Debug || env === Level.Info || env === Level.Warn ||
    env === Level.Error
    ? env
    : Level.Info,
);

function enabled(level: Level): boolean {
  return LEVELS.indexOf(level) >= min;
}

export function debug(...data: unknown[]): void {
  if (enabled(Level.Debug)) {
    console.debug(...data);
  }
}

export function info(...data: unknown[]): void {
  if (enabled(Level.Info)) {
    console.info(...data);
  }
}

export function warn(...data: unknown[]): void {
  if (enabled(Level.Warn)) {
    console.warn(...data);
  }
}

export function error(...data: unknown[]): void {
  if (enabled(Level.Error)) {
    console.error(...data);
  }
}
