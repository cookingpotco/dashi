export async function Slow() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return (
    <div>
      <h1 id="heading">slow</h1>
    </div>
  );
}
