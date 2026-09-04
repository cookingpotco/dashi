export function dropWriteHandler() {
  return new Response(
    new ReadableStream({
      start(controller) {
        // After the Response leaves the handler. A sync stream error becomes
        // a rendered 500.
        queueMicrotask(() => {
          controller.enqueue(new TextEncoder().encode("x"));
          controller.error(new Error("drop-write"));
        });
      },
    }),
    { headers: { "content-type": "application/octet-stream" } },
  );
}
