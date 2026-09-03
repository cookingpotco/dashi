export function Home() {
  return (
    <main>
      <h1>Home</h1>
      <p>
        <a href="/about">About</a>{" "}
        <a href="/about" hardNavigation>About (full load)</a>
      </p>
    </main>
  );
}
