import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

describe("JSX escaping", () => {
  it("renders an interpolated script tag inert in body position", () => {
    const payload = "<script>alert(1)</script>";

    assertEquals(
      String(<div>{payload}</div>),
      "<div>&lt;script&gt;alert(1)&lt;/script&gt;</div>",
    );
  });

  it("renders an interpolated attribute breakout inert", () => {
    const payload = `" onload="alert(1)`;

    assertEquals(
      String(<div title={payload}></div>),
      `<div title="&quot; onload=&quot;alert(1)"></div>`,
    );
  });

  it("inlines dangerouslySetInnerHTML without escaping", () => {
    assertEquals(
      String(<div dangerouslySetInnerHTML={{ __html: "<b>ok</b>" }}></div>),
      "<div><b>ok</b></div>",
    );
  });

  it("does not escape JSX children passed through a wrapper", () => {
    function Wrap({ children }: { children: string }) {
      return <section>{children}</section>;
    }

    assertEquals(
      // deno-fmt-ignore
      String(<Wrap><b>ok</b></Wrap>),
      "<section><b>ok</b></section>",
    );
  });

  it("still escapes user strings passed through a wrapper", () => {
    function Wrap({ children }: { children: string }) {
      return <section>{children}</section>;
    }

    assertEquals(
      String(<Wrap>{"<script>alert(1)</script>"}</Wrap>),
      "<section>&lt;script&gt;alert(1)&lt;/script&gt;</section>",
    );
  });

  it("escapes a plain string returned from a component", () => {
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
});

describe("JSX attribute names", () => {
  it("emits class from both className and class", () => {
    assertEquals(String(<div className="x"></div>), `<div class="x"></div>`);
    assertEquals(String(<div class="x"></div>), `<div class="x"></div>`);
  });

  it("emits for from both htmlFor and for", () => {
    assertEquals(
      String(<label htmlFor="id"></label>),
      `<label for="id"></label>`,
    );
    assertEquals(String(<label for="id"></label>), `<label for="id"></label>`);
  });

  it("remaps className on a DOM spread", () => {
    const props = { className: "x" };
    assertEquals(String(<div {...props}></div>), `<div class="x"></div>`);
  });

  it("passes className through to a function component", () => {
    function Probe(props: { className?: string }) {
      return <span>{props.className}</span>;
    }

    assertEquals(String(<Probe className="x" />), "<span>x</span>");
  });

  it("emits a string style attribute", () => {
    assertEquals(
      String(<div style="color:red"></div>),
      `<div style="color:red"></div>`,
    );
  });
});
