import type * as dom from "./dom_types.ts";

/** @internal */
export const trustedHtmlBrand: unique symbol = Symbol("dashi.trustedHtml");

/** HTML returned by JSX. */
export type Element = string & {
  /** @internal */
  readonly [trustedHtmlBrand]: true;
};

/** @internal */
export function isTrustedHtml(value: unknown): value is Element {
  return typeof value === "object" && value !== null &&
    trustedHtmlBrand in value;
}

/** @internal */
export function asTrustedHtml(html: string): Element {
  const value = new String(html) as Element;
  Object.defineProperty(value, trustedHtmlBrand, { value: true });
  return value;
}

/** A value that can appear as a JSX child. */
export type DashiNode = dom.Node | Element;

/** @internal */
export type ElementType<P extends Record<string, unknown> = never> =
  | keyof IntrinsicElements
  | ((props: P) => DashiNode)
  | null;

/** @internal */
export type ElementClass = never;

/** @internal */
export interface ElementChildrenAttribute {
  children: DashiNode | DashiNode[];
}

/** @ignore */
export interface IntrinsicElements {
  a: dom.AnchorHTMLAttributes;
  abbr: dom.HTMLAttributes;
  address: dom.HTMLAttributes;
  area: dom.AreaHTMLAttributes;
  article: dom.HTMLAttributes;
  aside: dom.HTMLAttributes;
  audio: dom.AudioHTMLAttributes;
  b: dom.HTMLAttributes;
  base: dom.BaseHTMLAttributes;
  bdi: dom.HTMLAttributes;
  bdo: dom.HTMLAttributes;
  blockquote: dom.BlockquoteHTMLAttributes;
  body: dom.HTMLAttributes;
  br: dom.HTMLAttributes;
  button: dom.ButtonHTMLAttributes;
  canvas: dom.CanvasHTMLAttributes;
  caption: dom.HTMLAttributes;
  cite: dom.HTMLAttributes;
  code: dom.HTMLAttributes;
  col: dom.ColHTMLAttributes;
  colgroup: dom.ColgroupHTMLAttributes;
  data: dom.DataHTMLAttributes;
  datalist: dom.HTMLAttributes;
  dd: dom.HTMLAttributes;
  del: dom.DelHTMLAttributes;
  details: dom.DetailsHTMLAttributes;
  dfn: dom.HTMLAttributes;
  dialog: dom.DialogHTMLAttributes;
  div: dom.HTMLAttributes;
  dl: dom.HTMLAttributes;
  dt: dom.HTMLAttributes;
  em: dom.HTMLAttributes;
  embed: dom.EmbedHTMLAttributes;
  fieldset: dom.FieldsetHTMLAttributes;
  figcaption: dom.HTMLAttributes;
  figure: dom.HTMLAttributes;
  footer: dom.HTMLAttributes;
  form: dom.FormHTMLAttributes;
  h1: dom.HTMLAttributes;
  h2: dom.HTMLAttributes;
  h3: dom.HTMLAttributes;
  h4: dom.HTMLAttributes;
  h5: dom.HTMLAttributes;
  h6: dom.HTMLAttributes;
  head: dom.HTMLAttributes;
  header: dom.HTMLAttributes;
  hgroup: dom.HTMLAttributes;
  hr: dom.HTMLAttributes;
  html: dom.HtmlHTMLAttributes;
  i: dom.HTMLAttributes;
  iframe: dom.IframeHTMLAttributes;
  img: dom.ImgHTMLAttributes;
  input: dom.InputHTMLAttributes;
  ins: dom.InsHTMLAttributes;
  kbd: dom.HTMLAttributes;
  label: dom.LabelHTMLAttributes;
  legend: dom.HTMLAttributes;
  li: dom.LiHTMLAttributes;
  link: dom.LinkHTMLAttributes;
  main: dom.HTMLAttributes;
  map: dom.MapHTMLAttributes;
  mark: dom.HTMLAttributes;
  menu: dom.MenuHTMLAttributes;
  meta: dom.MetaHTMLAttributes;
  meter: dom.MeterHTMLAttributes;
  nav: dom.HTMLAttributes;
  noscript: dom.HTMLAttributes;
  object: dom.ObjectHTMLAttributes;
  ol: dom.OlHTMLAttributes;
  optgroup: dom.OptgroupHTMLAttributes;
  option: dom.OptionHTMLAttributes;
  output: dom.OutputHTMLAttributes;
  p: dom.HTMLAttributes;
  picture: dom.HTMLAttributes;
  pre: dom.HTMLAttributes;
  progress: dom.ProgressHTMLAttributes;
  q: dom.QuoteHTMLAttributes;
  rp: dom.HTMLAttributes;
  rt: dom.HTMLAttributes;
  ruby: dom.HTMLAttributes;
  s: dom.HTMLAttributes;
  samp: dom.HTMLAttributes;
  search: dom.HTMLAttributes;
  slot: dom.SlotHTMLAttributes;
  script: dom.ScriptHTMLAttributes;
  section: dom.HTMLAttributes;
  select: dom.SelectHTMLAttributes;
  small: dom.HTMLAttributes;
  source: dom.SourceHTMLAttributes;
  span: dom.HTMLAttributes;
  strong: dom.HTMLAttributes;
  style: dom.StyleHTMLAttributes;
  sub: dom.HTMLAttributes;
  summary: dom.HTMLAttributes;
  sup: dom.HTMLAttributes;
  table: dom.TableHTMLAttributes;
  template: dom.HTMLAttributes;
  tbody: dom.HTMLAttributes;
  td: dom.TdHTMLAttributes;
  textarea: dom.TextareaHTMLAttributes;
  tfoot: dom.HTMLAttributes;
  th: dom.ThHTMLAttributes;
  thead: dom.HTMLAttributes;
  time: dom.TimeHTMLAttributes;
  title: dom.HTMLAttributes;
  tr: dom.HTMLAttributes;
  track: dom.TrackHTMLAttributes;
  u: dom.HTMLAttributes;
  ul: dom.HTMLAttributes;
  "var": dom.HTMLAttributes;
  video: dom.VideoHTMLAttributes;
  wbr: dom.HTMLAttributes;

  svg: dom.SVGAttributes;
  animate: dom.SVGAttributes;
  animateMotion: dom.SVGAttributes;
  animateTransform: dom.SVGAttributes;
  circle: dom.SVGAttributes;
  clipPath: dom.SVGAttributes;
  defs: dom.SVGAttributes;
  desc: dom.SVGAttributes;
  ellipse: dom.SVGAttributes;
  feBlend: dom.SVGAttributes;
  feColorMatrix: dom.SVGAttributes;
  feComponentTransfer: dom.SVGAttributes;
  feComposite: dom.SVGAttributes;
  feConvolveMatrix: dom.SVGAttributes;
  feDiffuseLighting: dom.SVGAttributes;
  feDisplacementMap: dom.SVGAttributes;
  feDistantLight: dom.SVGAttributes;
  feDropShadow: dom.SVGAttributes;
  feFlood: dom.SVGAttributes;
  feFuncA: dom.SVGAttributes;
  feFuncB: dom.SVGAttributes;
  feFuncG: dom.SVGAttributes;
  feFuncR: dom.SVGAttributes;
  feGaussianBlur: dom.SVGAttributes;
  feImage: dom.SVGAttributes;
  feMerge: dom.SVGAttributes;
  feMergeNode: dom.SVGAttributes;
  feMorphology: dom.SVGAttributes;
  feOffset: dom.SVGAttributes;
  fePointLight: dom.SVGAttributes;
  feSpecularLighting: dom.SVGAttributes;
  feSpotLight: dom.SVGAttributes;
  feTile: dom.SVGAttributes;
  feTurbulence: dom.SVGAttributes;
  filter: dom.SVGAttributes;
  foreignObject: dom.SVGAttributes;
  g: dom.SVGAttributes;
  image: dom.SVGAttributes;
  line: dom.SVGAttributes;
  linearGradient: dom.SVGAttributes;
  marker: dom.SVGAttributes;
  mask: dom.SVGAttributes;
  metadata: dom.SVGAttributes;
  mpath: dom.SVGAttributes;
  path: dom.SVGAttributes;
  pattern: dom.SVGAttributes;
  polygon: dom.SVGAttributes;
  polyline: dom.SVGAttributes;
  radialGradient: dom.SVGAttributes;
  rect: dom.SVGAttributes;
  set: dom.SVGAttributes;
  stop: dom.SVGAttributes;
  switch: dom.SVGAttributes;
  symbol: dom.SVGAttributes;
  text: dom.SVGAttributes;
  textPath: dom.SVGAttributes;
  tspan: dom.SVGAttributes;
  use: dom.SVGAttributes;
  view: dom.SVGAttributes;
}
