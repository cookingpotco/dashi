import { client, type ReadArgs, serve } from "dashi";

const Probe = client.element(
  "probe-el",
  new URL("./probe_client.ts", import.meta.url),
);

function home({ html }: ReadArgs) {
  return html(
    <html>
      <Probe>probe</Probe>
    </html>,
  );
}

function param({ ctx }: ReadArgs<{ id: string }>) {
  return new Response(`param:${ctx.params.id}`);
}

function caught({ ctx }: ReadArgs<{ path: string }>) {
  return new Response(`caught:${ctx.params.path}`);
}

export function start() {
  return serve(({ route }) => ({
    routes: [
      route("/", { GET: home }),
      route("/files/:id", { GET: param }),
      route("/:path*", { GET: caught }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
