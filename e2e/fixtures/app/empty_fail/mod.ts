import { group } from "dashi";

export const emptyFail = group("/empty-fail", ({ route }) => ({
  routes: [route("/", { GET: emptyFailHandler })],
}));

function emptyFailHandler() {
  return new Response("", { status: 500 });
}
