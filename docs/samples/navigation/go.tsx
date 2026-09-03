import { client } from "dashi";

export const Go = client.element(
  "dashi-go",
  new URL("./go_client.ts", import.meta.url),
);
