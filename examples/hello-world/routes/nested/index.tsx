import { Route } from "dashi";

export class NestedRoute implements Route {
  render() {
    return (
      <div>
        <code>nested</code>
      </div>
    );
  }
}
