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

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function formatCause(cause: unknown): string {
  if (cause instanceof Error) {
    if (cause.stack) {
      return collapse(cause.stack);
    }
    return collapse(`${cause.name}: ${cause.message}`);
  }
  return collapse(String(cause));
}

function formatLine(
  level: Level,
  labels: readonly string[],
  message: string,
  cause?: unknown,
): string {
  const parts = [new Date().toISOString(), level.toUpperCase()];
  for (const label of labels) {
    parts.push(`[${label}]`);
  }
  if (cause !== undefined) {
    parts.push(`${message}: ${formatCause(cause)}`);
  } else {
    parts.push(message);
  }
  return collapse(parts.join(" "));
}

export class Logger {
  private constructor() {}

  static debug(labels: readonly string[], message: string): void {
    if (enabled(Level.Debug)) {
      console.debug(formatLine(Level.Debug, labels, message));
    }
  }

  static info(labels: readonly string[], message: string): void {
    if (enabled(Level.Info)) {
      console.info(formatLine(Level.Info, labels, message));
    }
  }

  static warn(labels: readonly string[], message: string): void {
    if (enabled(Level.Warn)) {
      console.warn(formatLine(Level.Warn, labels, message));
    }
  }

  static error(
    labels: readonly string[],
    message: string,
    cause?: unknown,
  ): void {
    if (enabled(Level.Error)) {
      console.error(formatLine(Level.Error, labels, message, cause));
    }
  }
}
