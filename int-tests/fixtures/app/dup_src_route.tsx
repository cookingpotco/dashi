import { RouteFragment } from "dashi";

export function DupSrc() {
  return (
    <div id="dup-src">
      <div id="dup-a">
        <RouteFragment src="/nest-inner" />
      </div>
      <div id="dup-b">
        <RouteFragment src="/nest-inner" />
      </div>
    </div>
  );
}
