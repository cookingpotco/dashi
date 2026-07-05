import { parseRoutesDir } from "../fs/mod.ts";
import * as routing from "../routing/mod.ts";

export async function serveFileBased() {
  const rootDir = Deno.mainModule.replace(/\/[^\/]*$/, "");
  const routesDir = `${rootDir}/routes/`;

  const paths = await parseRoutesDir({ dir: routesDir });
  routing.init(paths);

  Deno.serve(routing.handle);
}
