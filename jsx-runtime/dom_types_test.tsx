import { describe, it } from "@std/testing/bdd";

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
}

describe("DOM attribute types", () => {
  it("is covered by compile-time checks in this file", () => {
    void typechecks;
  });
});
