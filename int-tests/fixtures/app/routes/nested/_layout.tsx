import { type Element } from "dashi";

export default function NestedLayout(
  _req: Request,
  children: Element,
): Element {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
}
