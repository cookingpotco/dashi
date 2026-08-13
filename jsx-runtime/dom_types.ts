export type Node = string | number | bigint | boolean | null;

type AttrValue = string | number | boolean;

type EventHandlerHint =
  "dashi does not support JSX event handlers; use a web component or a client script";

type Upper =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export interface DOMAttributes {
  children?: Node | Node[];
  dangerouslySetInnerHTML?: { __html: string };
  [name: `on${Upper}${string}`]: EventHandlerHint;
}

export interface AriaAttributes {
  [name: `aria-${string}`]: AttrValue | undefined;
  "aria-activedescendant"?: string;
  "aria-atomic"?: boolean;
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  "aria-braillelabel"?: string;
  "aria-brailleroledescription"?: string;
  "aria-busy"?: boolean;
  "aria-checked"?: boolean | "false" | "mixed" | "true";
  "aria-colcount"?: number;
  "aria-colindex"?: number;
  "aria-colindextext"?: string;
  "aria-colspan"?: number;
  "aria-controls"?: string;
  "aria-current"?:
    | boolean
    | "false"
    | "true"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
  "aria-describedby"?: string;
  "aria-description"?: string;
  "aria-details"?: string;
  "aria-disabled"?: boolean;
  "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup";
  "aria-errormessage"?: string;
  "aria-expanded"?: boolean;
  "aria-flowto"?: string;
  "aria-grabbed"?: boolean;
  "aria-haspopup"?:
    | boolean
    | "false"
    | "true"
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";
  "aria-hidden"?: boolean;
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  "aria-keyshortcuts"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-level"?: number;
  "aria-live"?: "off" | "assertive" | "polite";
  "aria-modal"?: boolean;
  "aria-multiline"?: boolean;
  "aria-multiselectable"?: boolean;
  "aria-orientation"?: "horizontal" | "vertical";
  "aria-owns"?: string;
  "aria-placeholder"?: string;
  "aria-posinset"?: number;
  "aria-pressed"?: boolean | "false" | "mixed" | "true";
  "aria-readonly"?: boolean;
  "aria-relevant"?:
    | "additions"
    | "additions removals"
    | "additions text"
    | "all"
    | "removals"
    | "removals additions"
    | "removals text"
    | "text"
    | "text additions"
    | "text removals";
  "aria-required"?: boolean;
  "aria-roledescription"?: string;
  "aria-rowcount"?: number;
  "aria-rowindex"?: number;
  "aria-rowindextext"?: string;
  "aria-rowspan"?: number;
  "aria-selected"?: boolean;
  "aria-setsize"?: number;
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  "aria-valuemax"?: number;
  "aria-valuemin"?: number;
  "aria-valuenow"?: number;
  "aria-valuetext"?: string;
}

export type AriaRole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "button"
  | "cell"
  | "checkbox"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "dialog"
  | "directory"
  | "document"
  | "feed"
  | "figure"
  | "form"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "img"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "marquee"
  | "math"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "textbox"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem"
  | (string & Record<never, never>);

interface BaseAttributes extends AriaAttributes, DOMAttributes {
  [name: `data-${string}`]: AttrValue | undefined;
  "class"?: string;
  className?: string;
  style?: string;
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  title?: string;
  role?: AriaRole;
  tabIndex?: number;
  part?: string;
}

export interface HTMLAttributes extends BaseAttributes {
  "for"?: string;
  htmlFor?: string;
  accessKey?: string;
  autoCapitalize?:
    | "off"
    | "none"
    | "on"
    | "sentences"
    | "words"
    | "characters"
    | (string & Record<never, never>);
  autoFocus?: boolean;
  contentEditable?: boolean | "inherit" | "plaintext-only";
  contextMenu?: string;
  dir?: string;
  draggable?: boolean;
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  hidden?: boolean;
  spellCheck?: boolean;
  translate?: "yes" | "no";

  about?: string;
  content?: string;
  datatype?: string;
  inlist?: AttrValue;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;

  autoCorrect?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;

  popover?: "" | "auto" | "manual" | "hint";
  popoverTargetAction?: "toggle" | "show" | "hide";
  popoverTarget?: string;

  inert?: boolean;
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  is?: string;
  exportparts?: string;
}

export type InternalSrc = `/${string}`;

export interface RouteFragmentAttributes extends HTMLAttributes {
  src: InternalSrc;
  lazy?: boolean;
}

export type HTMLAttributeReferrerPolicy =
  | ""
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

export type HTMLAttributeAnchorTarget =
  | "_self"
  | "_blank"
  | "_parent"
  | "_top"
  | (string & Record<never, never>);

export interface AnchorHTMLAttributes extends HTMLAttributes {
  download?: string;
  href?: string;
  hrefLang?: string;
  media?: string;
  ping?: string;
  target?: HTMLAttributeAnchorTarget;
  type?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

export interface MediaHTMLAttributes extends HTMLAttributes {
  autoPlay?: boolean;
  controls?: boolean;
  controlsList?: string;
  crossOrigin?: CrossOrigin;
  loop?: boolean;
  mediaGroup?: string;
  muted?: boolean;
  playsInline?: boolean;
  preload?: string;
  src?: string;
}

export interface AudioHTMLAttributes extends MediaHTMLAttributes {}

export interface AreaHTMLAttributes extends HTMLAttributes {
  alt?: string;
  coords?: string;
  download?: string;
  href?: string;
  hrefLang?: string;
  media?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  shape?: string;
  target?: string;
}

export interface BaseHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: string;
}

export interface BlockquoteHTMLAttributes extends HTMLAttributes {
  cite?: string;
}

export interface ButtonHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | number;
}

export interface CanvasHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  width?: number | string;
}

export interface ColHTMLAttributes extends HTMLAttributes {
  span?: number;
  width?: number | string;
}

export interface ColgroupHTMLAttributes extends HTMLAttributes {
  span?: number;
}

export interface DataHTMLAttributes extends HTMLAttributes {
  value?: string | number;
}

export interface DetailsHTMLAttributes extends HTMLAttributes {
  open?: boolean;
  name?: string;
}

export interface DelHTMLAttributes extends HTMLAttributes {
  cite?: string;
  dateTime?: string;
}

export interface DialogHTMLAttributes extends HTMLAttributes {
  closedby?: "any" | "closerequest" | "none";
  open?: boolean;
}

export interface EmbedHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  src?: string;
  type?: string;
  width?: number | string;
}

export interface FieldsetHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  name?: string;
}

export interface FormHTMLAttributes extends HTMLAttributes {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  encType?: string;
  method?: string;
  name?: string;
  noValidate?: boolean;
  target?: string;
}

export interface HtmlHTMLAttributes extends HTMLAttributes {
  manifest?: string;
}

export interface IframeHTMLAttributes extends HTMLAttributes {
  allow?: string;
  allowFullScreen?: boolean;
  allowTransparency?: boolean;
  frameBorder?: number | string;
  height?: number | string;
  loading?: "eager" | "lazy";
  marginHeight?: number;
  marginWidth?: number;
  name?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  sandbox?: string;
  scrolling?: string;
  seamless?: boolean;
  src?: string;
  srcDoc?: string;
  width?: number | string;
}

export type CrossOrigin = "anonymous" | "use-credentials" | "";

export interface ImgHTMLAttributes extends HTMLAttributes {
  alt?: string;
  crossOrigin?: CrossOrigin;
  decoding?: "async" | "auto" | "sync";
  fetchPriority?: "high" | "low" | "auto";
  height?: number | string;
  loading?: "eager" | "lazy";
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  sizes?: string;
  src?: string;
  srcSet?: string;
  useMap?: string;
  width?: number | string;
}

export interface InsHTMLAttributes extends HTMLAttributes {
  cite?: string;
  dateTime?: string;
}

export type HTMLInputTypeAttribute =
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week"
  | (string & Record<never, never>);

export interface InputHTMLAttributes extends HTMLAttributes {
  accept?: string;
  alt?: string;
  autoComplete?: string;
  capture?: boolean | "user" | "environment";
  checked?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  height?: number | string;
  list?: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | string;
  type?: HTMLInputTypeAttribute;
  value?: string | number;
  width?: number | string;
}

export interface LabelHTMLAttributes extends HTMLAttributes {
  form?: string;
}

export interface LiHTMLAttributes extends HTMLAttributes {
  value?: string | number;
}

export interface LinkHTMLAttributes extends HTMLAttributes {
  as?: string;
  blocking?: "render" | (string & Record<never, never>);
  crossOrigin?: CrossOrigin;
  fetchPriority?: "high" | "low" | "auto";
  href?: string;
  hrefLang?: string;
  integrity?: string;
  media?: string;
  imageSrcSet?: string;
  imageSizes?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  sizes?: string;
  type?: string;
  charSet?: string;
}

export interface MapHTMLAttributes extends HTMLAttributes {
  name?: string;
}

export interface MenuHTMLAttributes extends HTMLAttributes {
  type?: string;
}

export interface MetaHTMLAttributes extends HTMLAttributes {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  media?: string;
  name?: string;
}

export interface MeterHTMLAttributes extends HTMLAttributes {
  form?: string;
  high?: number;
  low?: number;
  max?: number | string;
  min?: number | string;
  optimum?: number;
  value?: string | number;
}

export interface QuoteHTMLAttributes extends HTMLAttributes {
  cite?: string;
}

export interface ObjectHTMLAttributes extends HTMLAttributes {
  classID?: string;
  data?: string;
  form?: string;
  height?: number | string;
  name?: string;
  type?: string;
  useMap?: string;
  width?: number | string;
  wmode?: string;
}

export interface OlHTMLAttributes extends HTMLAttributes {
  reversed?: boolean;
  start?: number;
  type?: "1" | "a" | "A" | "i" | "I";
}

export interface OptgroupHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  label?: string;
}

export interface OptionHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}

export interface OutputHTMLAttributes extends HTMLAttributes {
  form?: string;
  name?: string;
}

export interface ProgressHTMLAttributes extends HTMLAttributes {
  max?: number | string;
  value?: string | number;
}

export interface SlotHTMLAttributes extends HTMLAttributes {
  name?: string;
}

export interface ScriptHTMLAttributes extends HTMLAttributes {
  async?: boolean;
  blocking?: "render" | (string & Record<never, never>);
  charSet?: string;
  crossOrigin?: CrossOrigin;
  defer?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  src?: string;
  type?: string;
}

export interface SelectHTMLAttributes extends HTMLAttributes {
  autoComplete?: string;
  disabled?: boolean;
  form?: string;
  multiple?: boolean;
  name?: string;
  required?: boolean;
  size?: number;
  value?: string | number;
}

export interface SourceHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  media?: string;
  sizes?: string;
  src?: string;
  srcSet?: string;
  type?: string;
  width?: number | string;
}

export interface StyleHTMLAttributes extends HTMLAttributes {
  blocking?: "render" | (string & Record<never, never>);
  media?: string;
  scoped?: boolean;
  type?: string;
}

export interface TableHTMLAttributes extends HTMLAttributes {
  align?: "left" | "center" | "right";
  bgcolor?: string;
  border?: number;
  cellPadding?: number | string;
  cellSpacing?: number | string;
  frame?: boolean;
  rules?: "none" | "groups" | "rows" | "columns" | "all";
  summary?: string;
  width?: number | string;
}

export interface TextareaHTMLAttributes extends HTMLAttributes {
  autoComplete?: string;
  cols?: number;
  dirName?: string;
  disabled?: boolean;
  form?: string;
  maxLength?: number;
  minLength?: number;
  name?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  rows?: number;
  value?: string | number;
  wrap?: string;
}

export interface TdHTMLAttributes extends HTMLAttributes {
  align?: "left" | "center" | "right" | "justify" | "char";
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: string;
  abbr?: string;
  height?: number | string;
  width?: number | string;
  valign?: "top" | "middle" | "bottom" | "baseline";
}

export interface ThHTMLAttributes extends HTMLAttributes {
  align?: "left" | "center" | "right" | "justify" | "char";
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: string;
  abbr?: string;
}

export interface TimeHTMLAttributes extends HTMLAttributes {
  dateTime?: string;
}

export interface TrackHTMLAttributes extends HTMLAttributes {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srcLang?: string;
}

export interface VideoHTMLAttributes extends MediaHTMLAttributes {
  height?: number | string;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  disablePictureInPicture?: boolean;
  disableRemotePlayback?: boolean;
}

export interface SVGAttributes extends BaseAttributes {
  color?: string;
  height?: number | string;
  max?: number | string;
  media?: string;
  method?: string;
  min?: number | string;
  name?: string;
  target?: string;
  type?: string;
  width?: number | string;
  crossOrigin?: CrossOrigin;

  accentHeight?: number | string;
  accumulate?: "none" | "sum";
  additive?: "replace" | "sum";
  alignmentBaseline?:
    | "auto"
    | "baseline"
    | "before-edge"
    | "text-before-edge"
    | "middle"
    | "central"
    | "after-edge"
    | "text-after-edge"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "inherit";
  allowReorder?: "no" | "yes";
  alphabetic?: number | string;
  amplitude?: number | string;
  arabicForm?: "initial" | "medial" | "terminal" | "isolated";
  ascent?: number | string;
  attributeName?: string;
  attributeType?: string;
  autoReverse?: boolean;
  azimuth?: number | string;
  baseFrequency?: number | string;
  baselineShift?: number | string;
  baseProfile?: number | string;
  bbox?: number | string;
  begin?: number | string;
  bias?: number | string;
  by?: number | string;
  calcMode?: number | string;
  capHeight?: number | string;
  clip?: number | string;
  clipPath?: string;
  clipPathUnits?: number | string;
  clipRule?: number | string;
  colorInterpolation?: number | string;
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit";
  colorProfile?: number | string;
  colorRendering?: number | string;
  contentScriptType?: number | string;
  contentStyleType?: number | string;
  cursor?: number | string;
  cx?: number | string;
  cy?: number | string;
  d?: string;
  decelerate?: number | string;
  descent?: number | string;
  diffuseConstant?: number | string;
  direction?: number | string;
  display?: number | string;
  divisor?: number | string;
  dominantBaseline?:
    | "auto"
    | "use-script"
    | "no-change"
    | "reset-size"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "central"
    | "middle"
    | "text-after-edge"
    | "text-before-edge"
    | "inherit";
  dur?: number | string;
  dx?: number | string;
  dy?: number | string;
  edgeMode?: number | string;
  elevation?: number | string;
  enableBackground?: number | string;
  end?: number | string;
  exponent?: number | string;
  externalResourcesRequired?: boolean;
  fill?: string;
  fillOpacity?: number | string;
  fillRule?: "nonzero" | "evenodd" | "inherit";
  filter?: string;
  filterRes?: number | string;
  filterUnits?: number | string;
  floodColor?: number | string;
  floodOpacity?: number | string;
  focusable?: boolean | "auto";
  fontFamily?: string;
  fontSize?: number | string;
  fontSizeAdjust?: number | string;
  fontStretch?: number | string;
  fontStyle?: number | string;
  fontVariant?: number | string;
  fontWeight?: number | string;
  format?: number | string;
  fr?: number | string;
  from?: number | string;
  fx?: number | string;
  fy?: number | string;
  g1?: number | string;
  g2?: number | string;
  glyphName?: number | string;
  glyphOrientationHorizontal?: number | string;
  glyphOrientationVertical?: number | string;
  glyphRef?: number | string;
  gradientTransform?: string;
  gradientUnits?: string;
  hanging?: number | string;
  horizAdvX?: number | string;
  horizOriginX?: number | string;
  href?: string;
  ideographic?: number | string;
  imageRendering?: number | string;
  in2?: number | string;
  in?: string;
  intercept?: number | string;
  k1?: number | string;
  k2?: number | string;
  k3?: number | string;
  k4?: number | string;
  k?: number | string;
  kernelMatrix?: number | string;
  kernelUnitLength?: number | string;
  kerning?: number | string;
  keyPoints?: number | string;
  keySplines?: number | string;
  keyTimes?: number | string;
  lengthAdjust?: number | string;
  letterSpacing?: number | string;
  lightingColor?: number | string;
  limitingConeAngle?: number | string;
  local?: number | string;
  markerEnd?: string;
  markerHeight?: number | string;
  markerMid?: string;
  markerStart?: string;
  markerUnits?: number | string;
  markerWidth?: number | string;
  mask?: string;
  maskContentUnits?: number | string;
  maskUnits?: number | string;
  mathematical?: number | string;
  mode?: number | string;
  numOctaves?: number | string;
  offset?: number | string;
  opacity?: number | string;
  operator?: number | string;
  order?: number | string;
  orient?: number | string;
  orientation?: number | string;
  origin?: number | string;
  overflow?: number | string;
  overlinePosition?: number | string;
  overlineThickness?: number | string;
  paintOrder?: number | string;
  panose1?: number | string;
  path?: string;
  pathLength?: number | string;
  patternContentUnits?: string;
  patternTransform?: number | string;
  patternUnits?: string;
  pointerEvents?: number | string;
  points?: string;
  pointsAtX?: number | string;
  pointsAtY?: number | string;
  pointsAtZ?: number | string;
  preserveAlpha?: boolean;
  preserveAspectRatio?: string;
  primitiveUnits?: number | string;
  r?: number | string;
  radius?: number | string;
  refX?: number | string;
  refY?: number | string;
  renderingIntent?: number | string;
  repeatCount?: number | string;
  repeatDur?: number | string;
  requiredExtensions?: number | string;
  requiredFeatures?: number | string;
  restart?: number | string;
  result?: string;
  rotate?: number | string;
  rx?: number | string;
  ry?: number | string;
  scale?: number | string;
  seed?: number | string;
  shapeRendering?: number | string;
  slope?: number | string;
  spacing?: number | string;
  specularConstant?: number | string;
  specularExponent?: number | string;
  speed?: number | string;
  spreadMethod?: string;
  startOffset?: number | string;
  stdDeviation?: number | string;
  stemh?: number | string;
  stemv?: number | string;
  stitchTiles?: number | string;
  stopColor?: string;
  stopOpacity?: number | string;
  strikethroughPosition?: number | string;
  strikethroughThickness?: number | string;
  string?: number | string;
  stroke?: string;
  strokeDasharray?: string | number;
  strokeDashoffset?: string | number;
  strokeLinecap?: "butt" | "round" | "square" | "inherit";
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
  strokeMiterlimit?: number | string;
  strokeOpacity?: number | string;
  strokeWidth?: number | string;
  surfaceScale?: number | string;
  systemLanguage?: number | string;
  tableValues?: number | string;
  targetX?: number | string;
  targetY?: number | string;
  textAnchor?: "start" | "middle" | "end" | "inherit";
  textDecoration?: number | string;
  textLength?: number | string;
  textRendering?: number | string;
  to?: number | string;
  transform?: string;
  u1?: number | string;
  u2?: number | string;
  underlinePosition?: number | string;
  underlineThickness?: number | string;
  unicode?: number | string;
  unicodeBidi?: number | string;
  unicodeRange?: number | string;
  unitsPerEm?: number | string;
  vAlphabetic?: number | string;
  values?: string;
  vectorEffect?: number | string;
  version?: string;
  vertAdvY?: number | string;
  vertOriginX?: number | string;
  vertOriginY?: number | string;
  vHanging?: number | string;
  vIdeographic?: number | string;
  viewBox?: string;
  viewTarget?: number | string;
  visibility?: number | string;
  vMathematical?: number | string;
  widths?: number | string;
  wordSpacing?: number | string;
  writingMode?: number | string;
  x1?: number | string;
  x2?: number | string;
  x?: number | string;
  xChannelSelector?: string;
  xHeight?: number | string;
  xlinkActuate?: string;
  xlinkArcrole?: string;
  xlinkHref?: string;
  xlinkRole?: string;
  xlinkShow?: string;
  xlinkTitle?: string;
  xlinkType?: string;
  xmlBase?: string;
  xmlLang?: string;
  xmlns?: string;
  xmlnsXlink?: string;
  xmlSpace?: string;
  y1?: number | string;
  y2?: number | string;
  y?: number | string;
  yChannelSelector?: string;
  z?: number | string;
  zoomAndPan?: string;
}
