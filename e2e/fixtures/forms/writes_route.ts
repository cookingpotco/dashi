import { writeCount } from "./writes.ts";

export function writes() {
  return new Response(String(writeCount()));
}
