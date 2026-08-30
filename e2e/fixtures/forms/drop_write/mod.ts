import { group } from "dashi";

export const dropWrite = group("/drop-write", ({ route }) => ({
  routes: [route("/", { GET: dropWriteHandler, POST: dropWriteHandler })],
}));

function dropWriteHandler() {
  return new Response(
    new ReadableStream({
      start(controller) {
        // After the Response leaves the handler. A sync stream error becomes
        // a rendered 500; a 2xx text/html write is rejected before the body
        // is streamed.
        queueMicrotask(() => {
          controller.enqueue(new TextEncoder().encode("x"));
          controller.error(new Error("drop-write"));
        });
      },
    }),
    { headers: { "content-type": "application/octet-stream" } },
  );
}
