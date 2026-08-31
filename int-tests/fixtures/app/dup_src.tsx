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
      <div id="dup-c">
        <RouteFragment src="/./nest-inner" />
      </div>
      <div id="dup-d">
        <RouteFragment src="/nest-inner?" />
      </div>
    </div>
  );
}
