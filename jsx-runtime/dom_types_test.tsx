import { cached, CacheStrategy } from "../caching/mod.ts";

function typechecks() {
  const fn = () => {};

  <div className="x" data-id="1" style="color:red" />;
  <label htmlFor="id" />;
  // @ts-expect-error JSX uses className, not class
  <div class="y" />;
  // @ts-expect-error JSX uses htmlFor, not for
  <label for="id" />;

  // @ts-expect-error event handlers are not supported
  <div onClick={fn} />;
  // @ts-expect-error event handlers are not supported
  <div onSubmit={fn} />;
  // @ts-expect-error style objects are not supported
  <div style={{ color: "red" }} />;
  // @ts-expect-error hydration warnings are not a dashi concept
  <div suppressHydrationWarning />;

  // @ts-expect-error route-fragment is not a JSX intrinsic; use RouteFragment
  <route-fragment src="/x" />;
  // @ts-expect-error route-action is not a JSX intrinsic
  <route-action action="remove" src="/x" />;

  // @ts-expect-error cached() is not a JSX child
  <div>{cached(<span>x</span>, { strategy: CacheStrategy.Private })}</div>;
}

Deno.test("DOM attribute types typecheck", () => {
  void typechecks;
});
