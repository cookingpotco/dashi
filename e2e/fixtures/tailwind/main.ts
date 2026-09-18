import { serve } from "dashi";
import { generatedFile } from "@cookingpot/dashi-css";
import { Home } from "./home/mod.tsx";
import { RootLayout } from "./root_layout.tsx";

export function start() {
  if (import.meta.dirname === undefined) {
    throw new Error("import.meta.dirname is required");
  }
  const root = import.meta.dirname;
  return serve(({ route }) => ({
    layouts: [RootLayout],
    routes: [
      route("/", { GET: Home }),
      route("/generated/:file", { GET: generatedFile(root) }),
    ],
  }), { hostname: "127.0.0.1", port: 0 });
}
