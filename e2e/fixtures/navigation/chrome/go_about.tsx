import { client } from "dashi";

export const GoAbout = client.element(
  "go-about",
  new URL("./go_client.ts", import.meta.url),
);
