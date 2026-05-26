import { Route } from "saffron";

function fetchData() {
  return new Promise<{ hello: number }>((resolve) =>
    setTimeout(() => resolve({ hello: Math.random() }), 1000)
  );
}

export class HomeRoute implements Route {
  async render() {
    const { hello } = await fetchData();

    return (
      <html>
        <h1>Hello Yuna {"<3"} {hello.toFixed(2)}</h1>
      </html>
    );
  }
}
