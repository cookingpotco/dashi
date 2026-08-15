export default async function Echo(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  await new Promise((resolve) => setTimeout(resolve, 50));
  return <p id="echo">{id}</p>;
}
