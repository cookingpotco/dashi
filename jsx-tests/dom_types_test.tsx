import { cached, CacheStrategy } from "dashi";

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
  // @ts-expect-error navigation-root is not a JSX intrinsic; use NavigationRoot
  <navigation-root />;
  <a href="/x" hardNavigation />;
  <form hardNavigation />;
  <button type="submit" hardNavigation />;
  <input type="submit" hardNavigation />;
  <form method="POST" encType="multipart/form-data" />;
  // @ts-expect-error hardNavigation is not on arbitrary elements
  <div hardNavigation />;
  // @ts-expect-error method does not include DELETE; the browser would treat it as GET
  <form method="DELETE" />;
  // @ts-expect-error encType is the three spec keywords
  <form encType="application/json" />;
  // @ts-expect-error route-action is not a JSX intrinsic
  <route-action action="remove" src="/x" />;

  // @ts-expect-error cached() is not a JSX child
  <div>{cached(<span>x</span>, { strategy: CacheStrategy.NoStore })}</div>;
  // @ts-expect-error Private requires maxAge
  cached(<span>x</span>, { strategy: CacheStrategy.Private });
  // @ts-expect-error vary is not a CacheConfig key; use varyHeaders
  cached(<span>x</span>, { strategy: CacheStrategy.NoStore, vary: ["Accept"] });
}

Deno.test("DOM attribute types typecheck", () => {
  void typechecks;
});
