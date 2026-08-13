import { requestInlineFragment } from "../routing/mod.ts";

export * as JSX from "./jsx_types.ts";
export * from "./dom_types.ts";
export { type DashiNode } from "./jsx_types.ts";

const FRAGMENT_TAG = "route-fragment";

const trustedHtmlBrand = Symbol("dashi.trustedHtml");

/**
 * A string the JSX runtime will interpolate without escaping.
 * Produced by JSX itself and by {@link raw}.
 */
export type TrustedHtml = string & { readonly [trustedHtmlBrand]: true };

const ESCAPE_RE = /[&<>"']/g;
const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(ESCAPE_RE, (ch) => ESCAPE_MAP[ch]!);
}

function isTrustedHtml(value: unknown): value is TrustedHtml {
  return typeof value === "object" && value !== null &&
    trustedHtmlBrand in value;
}

/**
 * Treat `html` as already-rendered markup and interpolate it unchanged.
 * Passing unsanitized user input is an XSS vector.
 */
export function raw(html: string): TrustedHtml {
  const value = new String(html) as TrustedHtml;
  Object.defineProperty(value, trustedHtmlBrand, { value: true });
  return value;
}

export class JsxRuntimeError extends Error {
  constructor(...message: string[]) {
    super(message.join(" "));
  }
}

export function jsxTemplate(
  strings: string[],
  ...dynamic: unknown[]
): TrustedHtml {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(dynamic[i]);
  }
  arr.push(strings[strings.length - 1]);

  return raw(arr.join(""));
}

export function jsxAttr(name: string, value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (isTrustedHtml(value)) {
    return `${name}="${escapeHtml(String(value))}"`;
  }

  if (typeof value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      `Element was passed attribute "${name}"`,
      `containing a function/object (${value})`,
      "which is not allowed",
    );
  }

  if (value === true) {
    return name;
  }

  return `${name}="${escapeHtml(String(value))}"`;
}

export function jsxEscape(value: unknown): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (isTrustedHtml(value)) {
    return String(value);
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

  return escapeHtml(String(value));
}

export function jsx(
  type: ((props?: Record<string, unknown>) => string) | string,
  props?: Record<string, unknown> | null,
  _key?: string,
): string {
  if (typeof type === "function") {
    const res = type(props ?? {});
    if (isTrustedHtml(res)) {
      return res;
    }
    return jsxEscape(res);
  }

  const { children, ...rest } = props ?? {};
  const attrs = Object.entries(rest).map(([key, val]) => jsxAttr(key, val))
    .join(" ");

  if (type === FRAGMENT_TAG && !rest.lazy && typeof rest.src === "string") {
    requestInlineFragment(rest.src);

    return raw(
      `<${type} ${attrs}>${getInlineFragmentSlot(rest.src)}</${type}>`,
    );
  }

  return raw(`<${type} ${attrs}>${jsxEscape(children)}</${type}>`);
}

export function getInlineFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}
