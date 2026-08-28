import { serve } from "dashi";

export function start() {
  return serve(({ route }) => ({
    routes: [
      route("/", { GET: () => new Response("ok") }),
      route("/_dashi/client/:name", {
        GET: () => new Response("stolen"),
      }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}

if (import.meta.main) {
  start();
}
