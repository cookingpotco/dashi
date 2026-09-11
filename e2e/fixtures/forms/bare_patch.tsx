import { patch, type ReadArgs, type WriteArgs } from "dashi";

export function BarePatch({ html }: ReadArgs) {
  return html(
    <div>
      <h1 id="heading">bare-patch</h1>
      <p id="status"></p>
      <form id="bare-patch-form" method="POST" action="/bare-patch">
        <input id="bare-patch-title" name="title" />
        <button id="bare-patch-submit" type="submit">Save</button>
      </form>
    </div>,
  );
}

export async function patchWrite({ ctx, patches }: WriteArgs) {
  const data = await ctx.req.formData();
  const title = data.get("title");
  const text = typeof title === "string" && title.trim() !== ""
    ? title.trim()
    : "empty";
  return patches([
    patch.update("#status", <>{text}</>),
  ]);
}
