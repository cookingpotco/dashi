import { Route, RouteFragment } from "dashi";

export class EmbedRoute implements Route {
  render() {
    return (
      <div>
        <section id="eager">
          <RouteFragment src="/fragment" />
        </section>
        <section id="lazy">
          <RouteFragment
            src="/fragment"
            lazy
            fallback={<span id="fallback">Loading...</span>}
          />
        </section>
      </div>
    );
  }
}
