export async function Slow() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <p id="slow-body">slow-body</p>;
}
