export function postHtml() {
  return new Response("<p>nope</p>", {
    status: 200,
    headers: { "content-type": "text/html" },
  });
}
