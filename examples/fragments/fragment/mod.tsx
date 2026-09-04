import { type ReadArgs } from "dashi";

export async function Fragment({ html }: ReadArgs) {
  const res = await fetch(new URL("https://bored-api.appbrewery.com/random"));

  const json = await res.json();

  return html(
    <div>
      I can be rendered inline during SSR OR on the client!

      Here is something you can afterwards: {json.activity}
    </div>,
  );
}
