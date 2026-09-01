import { RouteFragment } from "dashi";

export function NestMid() {
  return (
    <div id="nest-mid">
      <RouteFragment src="/nest-inner" />
    </div>
  );
}
