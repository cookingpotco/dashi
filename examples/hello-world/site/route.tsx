import { Route } from "saffron";

export class HomeRoute implements Route {
  render() {
    const hello = Math.random();

    return (
      <html>
        <h1>Hello World! {hello.toFixed(2)}</h1>
      </html>
    );
  }
}
