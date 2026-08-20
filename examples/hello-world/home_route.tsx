function fetchData() {
  return new Promise<{ hello: number }>((resolve) =>
    setTimeout(() => resolve({ hello: Math.random() }), 1000)
  );
}

const TestComponent = ({ text }: { text: string }) => {
  return <footer>Test Footer {text} 2</footer>;
};

export async function Home() {
  const { hello } = await fetchData();

  return (
    <h1>
      Hello Yuna {"<3"} {hello.toFixed(2)}
      <TestComponent text="my footy" />
    </h1>
  );
}
