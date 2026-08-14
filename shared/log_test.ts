import { assertEquals } from "@std/assert";
import { debug, error, info, type LogLevel, setLogLevel, warn } from "./log.ts";

Deno.test("logger writes at or above the configured level", () => {
  const captured: Record<LogLevel, string[]> = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };
  const original = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  console.debug = (message: string) => {
    captured.debug.push(message);
  };
  console.info = (message: string) => {
    captured.info.push(message);
  };
  console.warn = (message: string) => {
    captured.warn.push(message);
  };
  console.error = (message: string) => {
    captured.error.push(message);
  };

  const emitAll = () => {
    debug("d");
    info("i");
    warn("w");
    error("e");
  };

  try {
    setLogLevel("debug");
    emitAll();
    assertEquals(captured, {
      debug: ["d"],
      info: ["i"],
      warn: ["w"],
      error: ["e"],
    });

    captured.debug = [];
    captured.info = [];
    captured.warn = [];
    captured.error = [];
    setLogLevel("info");
    emitAll();
    assertEquals(captured, {
      debug: [],
      info: ["i"],
      warn: ["w"],
      error: ["e"],
    });

    captured.debug = [];
    captured.info = [];
    captured.warn = [];
    captured.error = [];
    setLogLevel("warn");
    emitAll();
    assertEquals(captured, {
      debug: [],
      info: [],
      warn: ["w"],
      error: ["e"],
    });

    captured.debug = [];
    captured.info = [];
    captured.warn = [];
    captured.error = [];
    setLogLevel("error");
    emitAll();
    assertEquals(captured, {
      debug: [],
      info: [],
      warn: [],
      error: ["e"],
    });
  } finally {
    console.debug = original.debug;
    console.info = original.info;
    console.warn = original.warn;
    console.error = original.error;
    setLogLevel("info");
  }
});
