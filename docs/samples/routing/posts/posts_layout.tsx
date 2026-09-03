import type { WrapperCtx } from "dashi";
import type { Element } from "dashi/jsx-runtime";

export function PostsLayout(
  _ctx: WrapperCtx,
  children: Element,
): Element {
  return (
    <section>
      <h2>Posts</h2>
      {children}
    </section>
  );
}
