export type LogLevel = "debug" | "info" | "warn" | "error";

const rank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let level: LogLevel = "info";

/** Minimum level that is written. Default `info`; route registration is `debug`. */
export function setLogLevel(next: LogLevel): void {
  level = next;
}

function emit(
  at: LogLevel,
  write: (message: string) => void,
  message: string,
): void {
  if (rank[at] >= rank[level]) write(message);
}

export function debug(message: string): void {
  emit("debug", console.debug, message);
}

export function info(message: string): void {
  emit("info", console.info, message);
}

export function warn(message: string): void {
  emit("warn", console.warn, message);
}

export function error(message: string): void {
  emit("error", console.error, message);
}
