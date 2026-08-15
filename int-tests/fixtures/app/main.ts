import { serveFileBased } from "dashi";

if (import.meta.main) {
  serveFileBased({ port: 0 });
}
