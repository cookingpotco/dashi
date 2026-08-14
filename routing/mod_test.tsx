import { assertEquals } from "@std/assert";
import { handle, init } from "./mod.ts";

function yieldTimer(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

Deno.test("async middleware completes in order before handle returns", async () => {
  const events: string[] = [];
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };

  init([{
    pattern: new URLPattern({ pathname: "/mw-chain" }),
    layouts: [],
    route: {
      render() {
        events.push("render");
        return <p>ok</p>;
      },
    },
    middlewares: [
      {
        async preRender() {
          events.push("pre1-start");
          await yieldTimer();
          events.push("pre1-end");
        },
        postRender(res) {
          events.push("post1");
          res.headers.set("x-mw", "yes");
        },
      },
      {
        async preRender() {
          events.push("pre2-start");
          await yieldTimer();
          events.push("pre2-end");
        },
        async postRender() {
          events.push("post2-start");
          await yieldTimer();
          events.push("post2-end");
        },
      },
    ],
  }]);

  try {
    const res = await handle(new Request("http://example.com/mw-chain"));
    events.push("returned");

    assertEquals(events, [
      "pre1-start",
      "pre1-end",
      "pre2-start",
      "pre2-end",
      "render",
      "post1",
      "post2-start",
      "post2-end",
      "returned",
    ]);
    assertEquals(res.headers.get("x-mw"), "yes");
    assertEquals(res.headers.get("Content-Type"), "text/html");
    assertEquals(await res.text(), "<!DOCTYPE html><p>ok</p>");
    assertEquals(logs, []);
  } finally {
    console.log = originalLog;
  }
});
