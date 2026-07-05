export * as JSX from "./jsx_types.ts";
export * from "./dom_types.ts";
export { type DashiNode } from "./jsx_types.ts";

const FRAGMENT_TAG = "route-fragment";

export class JsxRuntimeError extends Error {
  constructor(...message: string[]) {
    super(message.join(" "));
  }
}

export function jsxTemplate(
  strings: string[],
  ...dynamic: string[]
): string {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(dynamic[i]);
  }
  arr.push(strings[strings.length - 1]);

  return arr.join("");
}

export function jsxAttr(name: string, value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      `Element was passed attribute "${name}"`,
      `containing a function/object (${value})`,
      "which is not allowed",
    );
  }

  if (value === true) {
    return name;
  }

  if (typeof value === "string") {
    return `${name}="${value}"`;
  }

  return `${name}=${value}`;
}

export function jsxEscape(value: unknown): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(jsxEscape).join("");
  }

  if (typeof value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      `Passed function/object (${value}) in JSX body`,
      "which is not allowed",
    );
  }

  return String(value);
}

export function jsx(
  type: ((props?: Record<string, unknown>) => string) | string,
  props?: Record<string, unknown> | null,
  _key?: string,
): string {
  if (typeof type === "function") {
    const res = type(props ?? {});
    return res;
  }

  const { children, ...rest } = props ?? {};
  const attrs = Object.entries(rest).map(([key, val]) => jsxAttr(key, val))
    .join(" ");

  if (type === FRAGMENT_TAG && !rest.lazy && typeof rest.src === "string") {
    return `<${type} ${attrs}>${getInlineFragmentSlot(rest.src)}</${type}>`;
  }

  return `<${type} ${attrs}>${jsxEscape(children)}</${type}>`;
}

export function getInlineFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}
