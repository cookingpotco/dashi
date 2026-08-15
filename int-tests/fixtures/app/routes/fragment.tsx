import { Route } from "dashi";

export class FragmentRoute implements Route {
  render() {
    return <aside id="frag">eager-fragment-body</aside>;
  }
}
