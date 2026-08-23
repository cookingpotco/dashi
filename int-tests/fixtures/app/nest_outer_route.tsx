import { RouteFragment } from "dashi";

export function NestOuter() {
  return (
    <div id="nest-outer">
      <RouteFragment src="/nest-mid" />
    </div>
  );
}
