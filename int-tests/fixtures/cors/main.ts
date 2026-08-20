import { route, serve } from "dashi";
import { cors } from "dashi/cors";

if (import.meta.main) {
  serve({
    middleware: [cors({ origin: "https://app.example" })],
    routes: [route("/", { GET: () => Response.json({ ok: true }) })],
  }, { port: 0 });
}
