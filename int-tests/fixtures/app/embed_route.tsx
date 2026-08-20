import { RouteFragment } from "dashi";

export function Embed() {
  return (
    <div>
      <section id="eager">
        <RouteFragment src="/fragment" />
        <RouteFragment src="/peer" />
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
