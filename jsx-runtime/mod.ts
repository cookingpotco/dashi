import { requestInlineFragment } from "../routing/mod.ts";
import { type Element, trustedHtmlBrand } from "./jsx_types.ts";

export type * as JSX from "./jsx_types.ts";
export * from "./dom_types.ts";
export { type DashiNode, type Element } from "./jsx_types.ts";

const FRAGMENT_TAG = "route-fragment";

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

function isTrustedHtml(value: unknown): value is Element {
  return typeof value === "object" && value !== null &&
    trustedHtmlBrand in value;
}

function asTrustedHtml(html: string): Element {
  const value = new String(html) as Element;
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
  ...dynamic: Array<string | Element>
): Element {
  const arr = [];

  for (let i = 0; i < dynamic.length; i++) {
    arr.push(strings[i]);
    arr.push(dynamic[i]);
  }
  arr.push(strings[strings.length - 1]);

  return asTrustedHtml(arr.join(""));
}

// Closed list matching Deno's jsx precompile remaps. Unknown names pass
// through; lowercasing would break viewBox and data-* on spreads.
export const HTML_ATTR_NAMES: Record<string, string> = {
  className: "class",
  htmlFor: "for",
  panose1: "panose-1",
  xlinkActuate: "xlink:actuate",
  xlinkArcrole: "xlink:arcrole",
  xlinkHref: "href",
  "xlink:href": "href",
  xlinkRole: "xlink:role",
  xlinkShow: "xlink:show",
  xlinkTitle: "xlink:title",
  xlinkType: "xlink:type",
  xmlBase: "xml:base",
  xmlLang: "xml:lang",
  xmlSpace: "xml:space",
  accentHeight: "accent-height",
  acceptCharset: "accept-charset",
  alignmentBaseline: "alignment-baseline",
  arabicForm: "arabic-form",
  baselineShift: "baseline-shift",
  capHeight: "cap-height",
  clipPath: "clip-path",
  clipRule: "clip-rule",
  colorInterpolation: "color-interpolation",
  colorInterpolationFilters: "color-interpolation-filters",
  colorProfile: "color-profile",
  colorRendering: "color-rendering",
  contentScriptType: "content-script-type",
  contentStyleType: "content-style-type",
  dominantBaseline: "dominant-baseline",
  enableBackground: "enable-background",
  fillOpacity: "fill-opacity",
  fillRule: "fill-rule",
  floodColor: "flood-color",
  floodOpacity: "flood-opacity",
  fontFamily: "font-family",
  fontSize: "font-size",
  fontSizeAdjust: "font-size-adjust",
  fontStretch: "font-stretch",
  fontStyle: "font-style",
  fontVariant: "font-variant",
  fontWeight: "font-weight",
  glyphName: "glyph-name",
  glyphOrientationHorizontal: "glyph-orientation-horizontal",
  glyphOrientationVertical: "glyph-orientation-vertical",
  horizAdvX: "horiz-adv-x",
  horizOriginX: "horiz-origin-x",
  horizOriginY: "horiz-origin-y",
  httpEquiv: "http-equiv",
  imageRendering: "image-rendering",
  letterSpacing: "letter-spacing",
  lightingColor: "lighting-color",
  markerEnd: "marker-end",
  markerMid: "marker-mid",
  markerStart: "marker-start",
  overlinePosition: "overline-position",
  overlineThickness: "overline-thickness",
  paintOrder: "paint-order",
  pointerEvents: "pointer-events",
  renderingIntent: "rendering-intent",
  shapeRendering: "shape-rendering",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
  strikethroughPosition: "strikethrough-position",
  strikethroughThickness: "strikethrough-thickness",
  strokeDasharray: "stroke-dasharray",
  strokeDashoffset: "stroke-dashoffset",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeMiterlimit: "stroke-miterlimit",
  strokeOpacity: "stroke-opacity",
  strokeWidth: "stroke-width",
  textAnchor: "text-anchor",
  textDecoration: "text-decoration",
  textRendering: "text-rendering",
  transformOrigin: "transform-origin",
  underlinePosition: "underline-position",
  underlineThickness: "underline-thickness",
  unicodeBidi: "unicode-bidi",
  unicodeRange: "unicode-range",
  unitsPerEm: "units-per-em",
  vAlphabetic: "v-alphabetic",
  vectorEffect: "vector-effect",
  vertAdvY: "vert-adv-y",
  vertOriginX: "vert-origin-x",
  vertOriginY: "vert-origin-y",
  vHanging: "v-hanging",
  vMathematical: "v-mathematical",
  wordSpacing: "word-spacing",
  writingMode: "writing-mode",
  xHeight: "x-height",
};

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

  const attr = HTML_ATTR_NAMES[name] ?? name;

  if (value === true) {
    return attr;
  }

  return `${attr}="${escapeHtml(String(value))}"`;
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
): Element {
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
