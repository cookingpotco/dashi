import { TestComponent } from "./test.tsx";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.serve((req) => {
    const url = new URL(req.url);

    if (req.url.match("favicon.ico")) {
      return new Response();
    }
    const query: Record<string, string> = {};
    url.searchParams.forEach((k, v) => query[k] = v);

    const text = `<!DOCTYPE html><html>${
      TestComponent({ urlParams: query })
    }</html>`;
    const res = new Response(text);

    res.headers.set("Content-Type", "text/html");

    console.log(`Served: ${text}`);

    return res;
  });
}
