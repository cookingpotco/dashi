import * as dom from "./dom_types.ts";

declare const trustedHtmlBrand: unique symbol;

export type TrustedHtml = string & { readonly [trustedHtmlBrand]: true };

export type Element = TrustedHtml;
export type DashiNode = dom.Node | Element;

export type ElementType<P extends Record<string, unknown> = never> =
  | keyof IntrinsicElements
  | ((props: P) => DashiNode)
  | null;

// We don't plan to support class components, so making them never
export type ElementClass = never;

export interface ElementChildrenAttribute {
  children: DashiNode | DashiNode[];
}

type MappedAttributes<T extends keyof HTMLElementTagNameMap> =
  dom.HTMLAttributes<
    HTMLElementTagNameMap[T]
  >;

export interface IntrinsicElements {
  a: dom.AnchorHTMLAttributes;
  abbr: MappedAttributes<"abbr">;
  address: MappedAttributes<"address">;
  area: dom.AreaHTMLAttributes;
  article: MappedAttributes<"article">;
  aside: MappedAttributes<"aside">;
  audio: dom.AudioHTMLAttributes;
  b: MappedAttributes<"b">;
  base: dom.BaseHTMLAttributes;
  bdi: MappedAttributes<"bdi">;
  bdo: MappedAttributes<"bdo">;
  blockquote: dom.BlockquoteHTMLAttributes;
  body: MappedAttributes<"body">;
  br: MappedAttributes<"br">;
  button: dom.ButtonHTMLAttributes;
  canvas: dom.CanvasHTMLAttributes;
  caption: MappedAttributes<"caption">;
  cite: MappedAttributes<"cite">;
  code: MappedAttributes<"code">;
  col: dom.ColHTMLAttributes;
  colgroup: dom.ColgroupHTMLAttributes;
  data: dom.DataHTMLAttributes;
  datalist: MappedAttributes<"datalist">;
  dd: MappedAttributes<"dd">;
  del: dom.DelHTMLAttributes;
  details: dom.DetailsHTMLAttributes;
  dfn: MappedAttributes<"dfn">;
  dialog: dom.DialogHTMLAttributes;
  div: MappedAttributes<"div">;
  dl: MappedAttributes<"dl">;
  dt: MappedAttributes<"dt">;
  em: MappedAttributes<"em">;
  embed: dom.EmbedHTMLAttributes;
  fieldset: dom.FieldsetHTMLAttributes;
  figcaption: MappedAttributes<"figcaption">;
  figure: MappedAttributes<"figure">;
  footer: MappedAttributes<"footer">;
  form: dom.FormHTMLAttributes;
  h1: MappedAttributes<"h1">;
  h2: MappedAttributes<"h2">;
  h3: MappedAttributes<"h3">;
  h4: MappedAttributes<"h4">;
  h5: MappedAttributes<"h5">;
  h6: MappedAttributes<"h6">;
  head: MappedAttributes<"head">;
  header: MappedAttributes<"header">;
  hgroup: MappedAttributes<"hgroup">;
  hr: MappedAttributes<"hr">;
  html: dom.HtmlHTMLAttributes;
  i: MappedAttributes<"i">;
  iframe: dom.IframeHTMLAttributes;
  img: dom.ImgHTMLAttributes;
  input: dom.InputHTMLAttributes;
  ins: dom.InsHTMLAttributes<HTMLModElement>;
  kbd: MappedAttributes<"kbd">;
  keygen: dom.KeygenHTMLAttributes;
  label: dom.LabelHTMLAttributes;
  legend: MappedAttributes<"legend">;
  li: dom.LiHTMLAttributes;
  link: dom.LinkHTMLAttributes;
  main: MappedAttributes<"main">;
  map: dom.MapHTMLAttributes;
  mark: MappedAttributes<"mark">;
  menu: dom.MenuHTMLAttributes;
  meta: dom.MetaHTMLAttributes;
  meter: dom.MeterHTMLAttributes;
  nav: MappedAttributes<"nav">;
  noscript: MappedAttributes<"noscript">;
  object: dom.ObjectHTMLAttributes;
  ol: dom.OlHTMLAttributes;
  optgroup: dom.OptgroupHTMLAttributes;
  option: dom.OptionHTMLAttributes;
  output: dom.OutputHTMLAttributes;
  p: MappedAttributes<"p">;
  picture: MappedAttributes<"picture">;
  pre: MappedAttributes<"pre">;
  progress: dom.ProgressHTMLAttributes;
  q: dom.QuoteHTMLAttributes;
  rp: MappedAttributes<"rp">;
  rt: MappedAttributes<"rt">;
  ruby: MappedAttributes<"ruby">;
  s: MappedAttributes<"s">;
  samp: MappedAttributes<"samp">;
  search: MappedAttributes<"search">;
  slot: dom.SlotHTMLAttributes;
  script: dom.ScriptHTMLAttributes;
  section: MappedAttributes<"section">;
  select: dom.SelectHTMLAttributes;
  small: MappedAttributes<"small">;
  source: dom.SourceHTMLAttributes;
  span: MappedAttributes<"span">;
  strong: MappedAttributes<"strong">;
  style: dom.StyleHTMLAttributes;
  sub: MappedAttributes<"sub">;
  summary: MappedAttributes<"summary">;
  sup: MappedAttributes<"sup">;
  table: dom.TableHTMLAttributes;
  template: MappedAttributes<"template">;
  tbody: MappedAttributes<"tbody">;
  td: dom.TdHTMLAttributes;
  textarea: dom.TextareaHTMLAttributes;
  tfoot: MappedAttributes<"tfoot">;
  th: dom.ThHTMLAttributes;
  thead: MappedAttributes<"thead">;
  time: dom.TimeHTMLAttributes;
  title: MappedAttributes<"title">;
  tr: MappedAttributes<"tr">;
  track: dom.TrackHTMLAttributes;
  u: MappedAttributes<"u">;
  ul: MappedAttributes<"ul">;
  "var": MappedAttributes<"var">;
  video: dom.VideoHTMLAttributes;
  wbr: MappedAttributes<"wbr">;
  webview: dom.WebViewHTMLAttributes;

  // SVG
  svg: dom.SVGAttributes<SVGSVGElement>;

  animate: dom.SVGAttributes<SVGAnimateElement>;
  animateMotion: dom.SVGAttributes<SVGElement>;
  animateTransform: dom.SVGAttributes<SVGAnimateTransformElement>;
  circle: dom.SVGAttributes<SVGCircleElement>;
  clipPath: dom.SVGAttributes<SVGClipPathElement>;
  defs: dom.SVGAttributes<SVGDefsElement>;
  desc: dom.SVGAttributes<SVGDescElement>;
  ellipse: dom.SVGAttributes<SVGEllipseElement>;
  feBlend: dom.SVGAttributes<SVGFEBlendElement>;
  feColorMatrix: dom.SVGAttributes<SVGFEColorMatrixElement>;
  feComponentTransfer: dom.SVGAttributes<SVGFEComponentTransferElement>;
  feComposite: dom.SVGAttributes<SVGFECompositeElement>;
  feConvolveMatrix: dom.SVGAttributes<SVGFEConvolveMatrixElement>;
  feDiffuseLighting: dom.SVGAttributes<SVGFEDiffuseLightingElement>;
  feDisplacementMap: dom.SVGAttributes<SVGFEDisplacementMapElement>;
  feDistantLight: dom.SVGAttributes<SVGFEDistantLightElement>;
  feDropShadow: dom.SVGAttributes<SVGFEDropShadowElement>;
  feFlood: dom.SVGAttributes<SVGFEFloodElement>;
  feFuncA: dom.SVGAttributes<SVGFEFuncAElement>;
  feFuncB: dom.SVGAttributes<SVGFEFuncBElement>;
  feFuncG: dom.SVGAttributes<SVGFEFuncGElement>;
  feFuncR: dom.SVGAttributes<SVGFEFuncRElement>;
  feGaussianBlur: dom.SVGAttributes<SVGFEGaussianBlurElement>;
  feImage: dom.SVGAttributes<SVGFEImageElement>;
  feMerge: dom.SVGAttributes<SVGFEMergeElement>;
  feMergeNode: dom.SVGAttributes<SVGFEMergeNodeElement>;
  feMorphology: dom.SVGAttributes<SVGFEMorphologyElement>;
  feOffset: dom.SVGAttributes<SVGFEOffsetElement>;
  fePointLight: dom.SVGAttributes<SVGFEPointLightElement>;
  feSpecularLighting: dom.SVGAttributes<SVGFESpecularLightingElement>;
  feSpotLight: dom.SVGAttributes<SVGFESpotLightElement>;
  feTile: dom.SVGAttributes<SVGFETileElement>;
  feTurbulence: dom.SVGAttributes<SVGFETurbulenceElement>;
  filter: dom.SVGAttributes<SVGFilterElement>;
  foreignObject: dom.SVGAttributes<SVGForeignObjectElement>;
  g: dom.SVGAttributes<SVGGElement>;
  image: dom.SVGAttributes<SVGImageElement>;
  line: dom.SVGAttributes<SVGLineElement>;
  linearGradient: dom.SVGAttributes<SVGLinearGradientElement>;
  marker: dom.SVGAttributes<SVGMarkerElement>;
  mask: dom.SVGAttributes<SVGMaskElement>;
  metadata: dom.SVGAttributes<SVGMetadataElement>;
  mpath: dom.SVGAttributes<SVGElement>;
  path: dom.SVGAttributes<SVGPathElement>;
  pattern: dom.SVGAttributes<SVGPatternElement>;
  polygon: dom.SVGAttributes<SVGPolygonElement>;
  polyline: dom.SVGAttributes<SVGPolylineElement>;
  radialGradient: dom.SVGAttributes<SVGRadialGradientElement>;
  rect: dom.SVGAttributes<SVGRectElement>;
  set: dom.SVGAttributes<SVGSetElement>;
  stop: dom.SVGAttributes<SVGStopElement>;
  switch: dom.SVGAttributes<SVGSwitchElement>;
  symbol: dom.SVGAttributes<SVGSymbolElement>;
  text: dom.SVGAttributes<SVGTextElement>;
  textPath: dom.SVGAttributes<SVGTextPathElement>;
  tspan: dom.SVGAttributes<SVGTSpanElement>;
  use: dom.SVGAttributes<SVGUseElement>;
  view: dom.SVGAttributes<SVGViewElement>;

  // custom elements
  "route-fragment": dom.RouteFragmentAttributes;
}
