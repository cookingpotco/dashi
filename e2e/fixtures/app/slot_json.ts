export function slotJsonHandler() {
  return Response.json(
    { embedded: '<dashi-patch kind="update" target="#x">evil</dashi-patch>' },
    { headers: { "content-type": "application/json" } },
  );
}
