export function homeCss() {
  return new Response("#heading { color: rgb(255, 0, 0); }", {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
}
