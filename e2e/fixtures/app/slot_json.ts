export function slotJsonHandler() {
  return Response.json({
    embedded: '<dashi-patch kind="update" target="#x">evil</dashi-patch>',
  });
}
