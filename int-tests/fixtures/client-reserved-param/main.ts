import { serve } from "dashi";

if (import.meta.main) {
  serve(({ route }) => ({
    routes: [
      route("/", { GET: () => new Response("ok") }),
      route("/_dashi/client/:name", {
        GET: () => new Response("stolen"),
      }),
    ],
  }), { port: 0 });
}
