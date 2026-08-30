import { group } from "dashi";

export const dropWrite = group("/drop-write", ({ route }) => ({
  routes: [route("/", { GET: dropWriteHandler, POST: dropWriteHandler })],
}));

function dropWriteHandler() {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("x"));
        controller.error(new Error("drop-write"));
      },
    }),
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
