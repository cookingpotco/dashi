import { describe, it } from "@std/testing/bdd";

function typechecks() {
  const fn = () => {};

  <div
    className="x"
    class="y"
    data-id="1"
    style="color:red"
  />;
  <label htmlFor="id" for="id" />;

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
