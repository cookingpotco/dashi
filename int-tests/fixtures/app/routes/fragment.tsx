export default function Fragment(req: Request) {
  return (
    <aside id="frag" data-pre={req.headers.get("x-pre")}>
      eager-fragment-body
    </aside>
  );
}
