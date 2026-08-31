import { writeCount } from "../writes.ts";

export function writesHandler() {
  return new Response(String(writeCount()));
}
