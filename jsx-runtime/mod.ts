import { requestInlineFragment } from "../routing/mod.ts";
import { type TrustedHtml } from "./jsx_types.ts";

export * as JSX from "./jsx_types.ts";
export * from "./dom_types.ts";
export { type DashiNode, type Element, type TrustedHtml } from "./jsx_types.ts";

const FRAGMENT_TAG = "route-fragment";

const trustedHtmlBrand = Symbol("dashi.trustedHtml");

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

export class JsxRuntimeError extends Error {
  constructor(...message: string[]) {
    super(message.join(" "));
  }
}

export function jsxTemplate(
  strings: string[],
  ...dynamic: Array<string | TrustedHtml | number | bigint | boolean | null>
): TrustedHtml {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(dynamic[i]);
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

function innerHtmlFromProp(value: unknown): string {
  if (typeof value === "object" && value !== null && "__html" in value) {
    return String(value.__html);
  }
  throw new JsxRuntimeError(
    "dangerouslySetInnerHTML must be `{ __html: string }`",
  );
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

  const { children, dangerouslySetInnerHTML, ...rest } = props ?? {};
  const attrs = Object.entries(rest).map(([key, val]) => jsxAttr(key, val))
    .join(" ");
  const open = attrs === "" ? `<${type}>` : `<${type} ${attrs}>`;

  if (type === FRAGMENT_TAG && !rest.lazy && typeof rest.src === "string") {
    requestInlineFragment(rest.src);

    return asTrustedHtml(
      `${open}${getInlineFragmentSlot(rest.src)}</${type}>`,
    );
  }

  if (dangerouslySetInnerHTML != null) {
    if (children != null) {
      throw new JsxRuntimeError(
        "Can only set one of `children` or `dangerouslySetInnerHTML`.",
      );
    }
    return asTrustedHtml(
      `${open}${innerHtmlFromProp(dangerouslySetInnerHTML)}</${type}>`,
    );
  }

  return asTrustedHtml(`${open}${jsxEscape(children)}</${type}>`);
}

export function getInlineFragmentSlot(src: string) {
  return `{{fragment:${src}}}`;
}
