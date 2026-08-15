import { RouteFragment } from "dashi";

function fetchData() {
  return new Promise<{ hello: number }>((resolve) =>
    setTimeout(() => resolve({ hello: Math.random() }), 1000)
  );
}

const TestComponent = ({ text }: { text: string }) => {
  return <footer>Test Footer {text} 2</footer>;
};

export default async function Home() {
  const { hello } = await fetchData();

  return (
    <main>
      <h1>
        Random number: {hello.toFixed(2)}
      </h1>
      <TestComponent text="my footy" />
      <RouteFragment src="/fragment" />
      <RouteFragment
        src="/fragment"
        lazy
        fallback={<span id={`123`}>Loading...</span>}
      />
    </main>
  );
}
