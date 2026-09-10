export function isRootRelativePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export function isHtmlContentType(type: string | null): boolean {
  return type !== null && type.toLowerCase().startsWith("text/html");
}

export function isSameOrigin(url: string | URL): boolean {
  return new URL(url, location.href).origin === location.origin;
}
