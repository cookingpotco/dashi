export function emptyFailHandler() {
  return new Response("", { status: 500 });
}
