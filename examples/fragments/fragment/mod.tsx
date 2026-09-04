import { type Ctx, type SealHtml } from "dashi";

export async function Fragment(_ctx: Ctx, html: SealHtml) {
  const res = await fetch(new URL("https://bored-api.appbrewery.com/random"));

  const json = await res.json();

  return html(
    <div>
      I can be rendered inline during SSR OR on the client!

      Here is something you can afterwards: {json.activity}
    </div>,
  );
}
