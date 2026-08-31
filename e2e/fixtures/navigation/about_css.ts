export async function aboutCss() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return new Response("#heading { color: rgb(0, 0, 255); }", {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
}
