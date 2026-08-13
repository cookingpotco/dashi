import { requestInlineFragment } from "../routing/mod.ts";

export * as JSX from "./jsx_types.ts";
export * from "./dom_types.ts";
export { type DashiNode } from "./jsx_types.ts";

const FRAGMENT_TAG = "route-fragment";

const trustedHtmlBrand = Symbol("dashi.trustedHtml");

/**
 * Already-rendered markup. JSX interpolates it without escaping.
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

function asTrustedHtml(html: string): TrustedHtml {
  const value = new String(html) as TrustedHtml;
  Object.defineProperty(value, trustedHtmlBrand, { value: true });
  return value;
}

/**
 * Treat `html` as already-rendered markup and interpolate it unchanged.
 * Passing unsanitized user input is an XSS vector.
 */
export function __dangerouslyInlineHtml(html: string): TrustedHtml {
  return asTrustedHtml(html);
}

export class JsxRuntimeError extends Error {
  constructor(...message: string[]) {
    super(message.join(" "));
  }
}

function interpolationToHtml(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (isTrustedHtml(value)) {
    return String(value);
  }
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }
  throw new JsxRuntimeError(
    `jsxTemplate received ${value} which is not allowed`,
  );
}

export function jsxTemplate(
  strings: string[],
  ...dynamic: unknown[]
): TrustedHtml {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(interpolationToHtml(dynamic[i]));
  }
  arr.push(strings[strings.length - 1]);

  return asTrustedHtml(arr.join(""));
}

export function jsxAttr(name: string, value: unknown): string {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (typeof value === "function" || typeof value === "object") {
    throw new JsxRuntimeError(
      isTrustedHtml(value)
        ? `Element was passed attribute "${name}" containing rendered HTML, which is not allowed`
        : `Element was passed attribute "${name}" containing a function/object (${value}) which is not allowed`,
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
  type: ((props?: Record<string, unknown>) => unknown) | string,
  props?: Record<string, unknown> | null,
  _key?: string,
): TrustedHtml {
  if (typeof type === "function") {
    const res = type(props ?? {});
    if (isTrustedHtml(res)) {
      return res;
    }
    return asTrustedHtml(jsxEscape(res));
  }

  const { children, ...rest } = props ?? {};
  const attrs = Object.entries(rest).map(([key, val]) => jsxAttr(key, val))
    .join(" ");

  if (type === FRAGMENT_TAG && !rest.lazy && typeof rest.src === "string") {
    requestInlineFragment(rest.src);

    return asTrustedHtml(
      `<${type} ${attrs}>${getInlineFragmentSlot(rest.src)}</${type}>`,
    );
  }

  return asTrustedHtml(`<${type} ${attrs}>${jsxEscape(children)}</${type}>`);
}

export function getInlineFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}
