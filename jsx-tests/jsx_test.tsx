import { assertEquals } from "@std/assert";
import { MAPPED_HTML_ATTR_NAMES } from "dashi/jsx-runtime";

Deno.test("renders an interpolated script tag inert in body position", () => {
  const payload = "<script>alert(1)</script>";

  assertEquals(
    String(<div>{payload}</div>),
    "<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>",
  );
});

Deno.test("renders an interpolated attribute breakout inert", () => {
  const payload = `" onload="alert(1)`;

  assertEquals(
    String(<div title={payload}></div>),
    `<div title="&quot; onload=&quot;alert(1)"></div>`,
  );
});

Deno.test("inlines dangerouslySetInnerHTML without escaping", () => {
  assertEquals(
    String(<div dangerouslySetInnerHTML={{ __html: "<b>ok</b>" }}></div>),
    "<div><b>ok</b></div>",
  );
});

Deno.test("does not escape JSX children passed through a wrapper", () => {
  function Wrap({ children }: { children: string }) {
    return <section>{children}</section>;
  }

  assertEquals(
    // deno-fmt-ignore
    String(<Wrap><b>ok</b></Wrap>),
    "<section><b>ok</b></section>",
  );
});

Deno.test("escapes user strings passed through a wrapper", () => {
  function Wrap({ children }: { children: string }) {
    return <section>{children}</section>;
  }

  assertEquals(
    String(<Wrap>{"<script>alert(1)</script>"}</Wrap>),
    "<section>&lt;script&gt;alert(1)&lt;/script&gt;</section>",
  );
});

Deno.test("escapes a plain string returned from a component", () => {
  function Echo({ text }: { text: string }) {
    return text;
  }

  assertEquals(
    String(
      <div>
        <Echo text="<script>alert(1)</script>" />
      </div>,
    ),
    "<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>",
  );
});

Deno.test("emits class when className is set", () => {
  assertEquals(String(<div className="x"></div>), `<div class="x"></div>`);
});

Deno.test("emits for when htmlFor is set", () => {
  assertEquals(
    String(<label htmlFor="id"></label>),
    `<label for="id"></label>`,
  );
});

Deno.test("remaps closed-list names on a DOM spread", () => {
  const props = Object.fromEntries(
    Object.keys(MAPPED_HTML_ATTR_NAMES).map((name) => [name, "x"]),
  );
  const attrs = Object.values(MAPPED_HTML_ATTR_NAMES)
    .map((name) => `${name}="x"`)
    .join(" ");
  assertEquals(String(<div {...props}></div>), `<div ${attrs}></div>`);
});

Deno.test("passes className through to a function component", () => {
  function Probe(props: { className?: string }) {
    return <span>{props.className}</span>;
  }

  assertEquals(String(<Probe className="x" />), "<span>x</span>");
});

Deno.test("emits a string style attribute", () => {
  assertEquals(
    String(<div style="color:red"></div>),
    `<div style="color:red"></div>`,
  );
});

Deno.test("emits hardNavigation as a boolean attribute on anchors", () => {
  assertEquals(
    String(<a href="/x" hardNavigation></a>),
    `<a href="/x" hardnavigation></a>`,
  );
});

Deno.test("emits hardNavigation as a boolean attribute on forms", () => {
  assertEquals(
    String(<form hardNavigation></form>),
    `<form hardnavigation></form>`,
  );
});

Deno.test("omits the closing tag on a void element", () => {
  assertEquals(String(<br />), "<br>");
});

Deno.test("omits the closing tag when spreading onto a void element", () => {
  const brProps = {};
  const imgProps = { src: "x" };
  assertEquals(String(<br {...brProps} />), "<br>");
  assertEquals(String(<img {...imgProps} />), `<img src="x">`);
});

Deno.test("renders a no-props intrinsic with open and close tags", () => {
  assertEquals(String(<div />), "<div></div>");
});

Deno.test("joins adjacent dynamic children", () => {
  const a = "x";
  const b = "y";
  assertEquals(
    // deno-fmt-ignore
    String(<div>{a}{b}</div>),
    "<div>xy</div>",
  );
});

Deno.test("renders an array of mixed children", () => {
  assertEquals(
    // deno-fmt-ignore
    String(<div>{["hi", <b>ok</b>, 0]}</div>),
    "<div>hi<b>ok</b>0</div>",
  );
});
