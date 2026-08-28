/** @internal */
export type Node = string | number | bigint | boolean | null;

/** @internal */
type AttrValue = string | number | boolean;

/** @internal */
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

/** @internal */
export interface DOMAttributes {
  children?: Node | Node[];
  dangerouslySetInnerHTML?: { __html: string };
  [name: `on${Upper}${string}`]: EventHandlerHint;
}

/** @internal */
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

/** @internal */
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

/** @internal */
interface BaseAttributes extends AriaAttributes, DOMAttributes {
  [name: `data-${string}`]: AttrValue | undefined;
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

/** Shared HTML element attributes. Per-tag extras are `JSX.IntrinsicElements["a"]`. */
export interface HTMLAttributes extends BaseAttributes {
  /** Form control this label is for. */
  htmlFor?: string;
  /** Keyboard shortcut. */
  accessKey?: string;
  /** Virtual-keyboard autocapitalize. */
  autoCapitalize?:
    | "off"
    | "none"
    | "on"
    | "sentences"
    | "words"
    | "characters"
    | (string & Record<never, never>);
  /** Focus on page load. */
  autoFocus?: boolean;
  /** Whether the element is editable. */
  contentEditable?: boolean | "inherit" | "plaintext-only";
  /** Context menu id. */
  contextMenu?: string;
  /** Text direction. */
  dir?: string;
  /** Whether the element is draggable. */
  draggable?: boolean;
  /** Virtual-keyboard enter-key label. */
  enterKeyHint?:
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  /** Hide from rendering. */
  hidden?: boolean;
  /** Spell-check. */
  spellCheck?: boolean;
  /** Whether to translate content. */
  translate?: "yes" | "no";

  /** RDFa about. */
  about?: string;
  /** RDFa or meta content. */
  content?: string;
  /** RDFa datatype. */
  datatype?: string;
  /** RDFa inlist. */
  inlist?: AttrValue;
  /** RDFa prefix. */
  prefix?: string;
  /** RDFa property. */
  property?: string;
  /** Link relationship. */
  rel?: string;
  /** RDFa resource. */
  resource?: string;
  /** RDFa reverse relationship. */
  rev?: string;
  /** RDFa typeof. */
  typeof?: string;
  /** RDFa vocab. */
  vocab?: string;

  /** Autocorrect hint. */
  autoCorrect?: string;
  /** Presentational color. */
  color?: string;
  /** Microdata property. */
  itemProp?: string;
  /** Microdata item scope. */
  itemScope?: boolean;
  /** Microdata item type. */
  itemType?: string;
  /** Microdata item id. */
  itemID?: string;
  /** Microdata item ref. */
  itemRef?: string;

  /** Popover state. */
  popover?: "" | "auto" | "manual" | "hint";
  /** Popover target action. */
  popoverTargetAction?: "toggle" | "show" | "hide";
  /** Popover target id. */
  popoverTarget?: string;

  /** Make the subtree inert. */
  inert?: boolean;
  /** Virtual-keyboard mode. */
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  /** Customized built-in element. */
  is?: string;
  /** Export shadow parts. */
  exportparts?: string;
}

/** @internal */
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

/** @internal */
export type HTMLAttributeAnchorTarget =
  | "_self"
  | "_blank"
  | "_parent"
  | "_top"
  | (string & Record<never, never>);

/** @internal */
type FormMethod = "GET" | "POST" | "dialog";

/** @internal */
type FormEncType =
  | "application/x-www-form-urlencoded"
  | "multipart/form-data"
  | "text/plain";

/** @internal */
export interface AnchorHTMLAttributes extends HTMLAttributes {
  download?: string;
  /** Skip soft navigation and load this link as a document. */
  hardNavigation?: boolean;
  href?: string;
  hrefLang?: string;
  media?: string;
  ping?: string;
  target?: HTMLAttributeAnchorTarget;
  type?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

/** @internal */
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

/** @internal */
export interface AudioHTMLAttributes extends MediaHTMLAttributes {}

/** @internal */
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

/** @internal */
export interface BaseHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: string;
}

/** @internal */
export interface BlockquoteHTMLAttributes extends HTMLAttributes {
  cite?: string;
}

/** @internal */
export interface ButtonHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: FormEncType;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: string;
  /** Skip soft navigation and load this link as a document. */
  hardNavigation?: boolean;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | number;
}

/** @internal */
export interface CanvasHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  width?: number | string;
}

/** @internal */
export interface ColHTMLAttributes extends HTMLAttributes {
  span?: number;
  width?: number | string;
}

/** @internal */
export interface ColgroupHTMLAttributes extends HTMLAttributes {
  span?: number;
}

/** @internal */
export interface DataHTMLAttributes extends HTMLAttributes {
  value?: string | number;
}

/** @internal */
export interface DetailsHTMLAttributes extends HTMLAttributes {
  open?: boolean;
  name?: string;
}

/** @internal */
export interface DelHTMLAttributes extends HTMLAttributes {
  cite?: string;
  dateTime?: string;
}

/** @internal */
export interface DialogHTMLAttributes extends HTMLAttributes {
  closedby?: "any" | "closerequest" | "none";
  open?: boolean;
}

/** @internal */
export interface EmbedHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  src?: string;
  type?: string;
  width?: number | string;
}

/** @internal */
export interface FieldsetHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  form?: string;
  name?: string;
}

/** @internal */
export interface FormHTMLAttributes extends HTMLAttributes {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  encType?: FormEncType;
  /** Skip soft navigation and load this link as a document. */
  hardNavigation?: boolean;
  method?: FormMethod;
  name?: string;
  noValidate?: boolean;
  target?: string;
}

/** @internal */
export interface HtmlHTMLAttributes extends HTMLAttributes {
  manifest?: string;
}

/** @internal */
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

/** @internal */
export type CrossOrigin = "anonymous" | "use-credentials" | "";

/** @internal */
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

/** @internal */
export interface InsHTMLAttributes extends HTMLAttributes {
  cite?: string;
  dateTime?: string;
}

/** @internal */
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

/** @internal */
export interface InputHTMLAttributes extends HTMLAttributes {
  accept?: string;
  alt?: string;
  autoComplete?: string;
  capture?: boolean | "user" | "environment";
  checked?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: FormEncType;
  formMethod?: FormMethod;
  formNoValidate?: boolean;
  formTarget?: string;
  /** Skip soft navigation and load this link as a document. */
  hardNavigation?: boolean;
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

/** @internal */
export interface LabelHTMLAttributes extends HTMLAttributes {
  form?: string;
}

/** @internal */
export interface LiHTMLAttributes extends HTMLAttributes {
  value?: string | number;
}

/** @internal */
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

/** @internal */
export interface MapHTMLAttributes extends HTMLAttributes {
  name?: string;
}

/** @internal */
export interface MenuHTMLAttributes extends HTMLAttributes {
  type?: string;
}

/** @internal */
export interface MetaHTMLAttributes extends HTMLAttributes {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  media?: string;
  name?: string;
}

/** @internal */
export interface MeterHTMLAttributes extends HTMLAttributes {
  form?: string;
  high?: number;
  low?: number;
  max?: number | string;
  min?: number | string;
  optimum?: number;
  value?: string | number;
}

/** @internal */
export interface QuoteHTMLAttributes extends HTMLAttributes {
  cite?: string;
}

/** @internal */
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

/** @internal */
export interface OlHTMLAttributes extends HTMLAttributes {
  reversed?: boolean;
  start?: number;
  type?: "1" | "a" | "A" | "i" | "I";
}

/** @internal */
export interface OptgroupHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  label?: string;
}

/** @internal */
export interface OptionHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}

/** @internal */
export interface OutputHTMLAttributes extends HTMLAttributes {
  form?: string;
  name?: string;
}

/** @internal */
export interface ProgressHTMLAttributes extends HTMLAttributes {
  max?: number | string;
  value?: string | number;
}

/** @internal */
export interface SlotHTMLAttributes extends HTMLAttributes {
  name?: string;
}

/** @internal */
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

/** @internal */
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

/** @internal */
export interface SourceHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  media?: string;
  sizes?: string;
  src?: string;
  srcSet?: string;
  type?: string;
  width?: number | string;
}

/** @internal */
export interface StyleHTMLAttributes extends HTMLAttributes {
  blocking?: "render" | (string & Record<never, never>);
  media?: string;
  scoped?: boolean;
  type?: string;
}

/** @internal */
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

/** @internal */
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

/** @internal */
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

/** @internal */
export interface ThHTMLAttributes extends HTMLAttributes {
  align?: "left" | "center" | "right" | "justify" | "char";
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: string;
  abbr?: string;
}

/** @internal */
export interface TimeHTMLAttributes extends HTMLAttributes {
  dateTime?: string;
}

/** @internal */
export interface TrackHTMLAttributes extends HTMLAttributes {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srcLang?: string;
}

/** @internal */
export interface VideoHTMLAttributes extends MediaHTMLAttributes {
  height?: number | string;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  disablePictureInPicture?: boolean;
  disableRemotePlayback?: boolean;
}

/** Shared SVG element attributes. */
export interface SVGAttributes extends BaseAttributes {
  /** SVG `color` attribute. */
  color?: string;
  /** SVG `height` attribute. */
  height?: number | string;
  /** SVG `max` attribute. */
  max?: number | string;
  /** SVG `media` attribute. */
  media?: string;
  /** SVG `method` attribute. */
  method?: string;
  /** SVG `min` attribute. */
  min?: number | string;
  /** SVG `name` attribute. */
  name?: string;
  /** SVG `target` attribute. */
  target?: string;
  /** SVG `type` attribute. */
  type?: string;
  /** SVG `width` attribute. */
  width?: number | string;
  /** SVG `crossOrigin` attribute. */
  crossOrigin?: CrossOrigin;

  /** SVG `accentHeight` attribute. */
  accentHeight?: number | string;
  /** SVG `accumulate` attribute. */
  accumulate?: "none" | "sum";
  /** SVG `additive` attribute. */
  additive?: "replace" | "sum";
  /** SVG `alignmentBaseline` attribute. */
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
  /** SVG `allowReorder` attribute. */
  allowReorder?: "no" | "yes";
  /** SVG `alphabetic` attribute. */
  alphabetic?: number | string;
  /** SVG `amplitude` attribute. */
  amplitude?: number | string;
  /** SVG `arabicForm` attribute. */
  arabicForm?: "initial" | "medial" | "terminal" | "isolated";
  /** SVG `ascent` attribute. */
  ascent?: number | string;
  /** SVG `attributeName` attribute. */
  attributeName?: string;
  /** SVG `attributeType` attribute. */
  attributeType?: string;
  /** SVG `autoReverse` attribute. */
  autoReverse?: boolean;
  /** SVG `azimuth` attribute. */
  azimuth?: number | string;
  /** SVG `baseFrequency` attribute. */
  baseFrequency?: number | string;
  /** SVG `baselineShift` attribute. */
  baselineShift?: number | string;
  /** SVG `baseProfile` attribute. */
  baseProfile?: number | string;
  /** SVG `bbox` attribute. */
  bbox?: number | string;
  /** SVG `begin` attribute. */
  begin?: number | string;
  /** SVG `bias` attribute. */
  bias?: number | string;
  /** SVG `by` attribute. */
  by?: number | string;
  /** SVG `calcMode` attribute. */
  calcMode?: number | string;
  /** SVG `capHeight` attribute. */
  capHeight?: number | string;
  /** SVG `clip` attribute. */
  clip?: number | string;
  /** SVG `clipPath` attribute. */
  clipPath?: string;
  /** SVG `clipPathUnits` attribute. */
  clipPathUnits?: number | string;
  /** SVG `clipRule` attribute. */
  clipRule?: number | string;
  /** SVG `colorInterpolation` attribute. */
  colorInterpolation?: number | string;
  /** SVG `colorInterpolationFilters` attribute. */
  colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit";
  /** SVG `colorProfile` attribute. */
  colorProfile?: number | string;
  /** SVG `colorRendering` attribute. */
  colorRendering?: number | string;
  /** SVG `contentScriptType` attribute. */
  contentScriptType?: number | string;
  /** SVG `contentStyleType` attribute. */
  contentStyleType?: number | string;
  /** SVG `cursor` attribute. */
  cursor?: number | string;
  /** SVG `cx` attribute. */
  cx?: number | string;
  /** SVG `cy` attribute. */
  cy?: number | string;
  /** SVG `d` attribute. */
  d?: string;
  /** SVG `decelerate` attribute. */
  decelerate?: number | string;
  /** SVG `descent` attribute. */
  descent?: number | string;
  /** SVG `diffuseConstant` attribute. */
  diffuseConstant?: number | string;
  /** SVG `direction` attribute. */
  direction?: number | string;
  /** SVG `display` attribute. */
  display?: number | string;
  /** SVG `divisor` attribute. */
  divisor?: number | string;
  /** SVG `dominantBaseline` attribute. */
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
  /** SVG `dur` attribute. */
  dur?: number | string;
  /** SVG `dx` attribute. */
  dx?: number | string;
  /** SVG `dy` attribute. */
  dy?: number | string;
  /** SVG `edgeMode` attribute. */
  edgeMode?: number | string;
  /** SVG `elevation` attribute. */
  elevation?: number | string;
  /** SVG `enableBackground` attribute. */
  enableBackground?: number | string;
  /** SVG `end` attribute. */
  end?: number | string;
  /** SVG `exponent` attribute. */
  exponent?: number | string;
  /** SVG `externalResourcesRequired` attribute. */
  externalResourcesRequired?: boolean;
  /** SVG `fill` attribute. */
  fill?: string;
  /** SVG `fillOpacity` attribute. */
  fillOpacity?: number | string;
  /** SVG `fillRule` attribute. */
  fillRule?: "nonzero" | "evenodd" | "inherit";
  /** SVG `filter` attribute. */
  filter?: string;
  /** SVG `filterRes` attribute. */
  filterRes?: number | string;
  /** SVG `filterUnits` attribute. */
  filterUnits?: number | string;
  /** SVG `floodColor` attribute. */
  floodColor?: number | string;
  /** SVG `floodOpacity` attribute. */
  floodOpacity?: number | string;
  /** SVG `focusable` attribute. */
  focusable?: boolean | "auto";
  /** SVG `fontFamily` attribute. */
  fontFamily?: string;
  /** SVG `fontSize` attribute. */
  fontSize?: number | string;
  /** SVG `fontSizeAdjust` attribute. */
  fontSizeAdjust?: number | string;
  /** SVG `fontStretch` attribute. */
  fontStretch?: number | string;
  /** SVG `fontStyle` attribute. */
  fontStyle?: number | string;
  /** SVG `fontVariant` attribute. */
  fontVariant?: number | string;
  /** SVG `fontWeight` attribute. */
  fontWeight?: number | string;
  /** SVG `format` attribute. */
  format?: number | string;
  /** SVG `fr` attribute. */
  fr?: number | string;
  /** SVG `from` attribute. */
  from?: number | string;
  /** SVG `fx` attribute. */
  fx?: number | string;
  /** SVG `fy` attribute. */
  fy?: number | string;
  /** SVG `g1` attribute. */
  g1?: number | string;
  /** SVG `g2` attribute. */
  g2?: number | string;
  /** SVG `glyphName` attribute. */
  glyphName?: number | string;
  /** SVG `glyphOrientationHorizontal` attribute. */
  glyphOrientationHorizontal?: number | string;
  /** SVG `glyphOrientationVertical` attribute. */
  glyphOrientationVertical?: number | string;
  /** SVG `glyphRef` attribute. */
  glyphRef?: number | string;
  /** SVG `gradientTransform` attribute. */
  gradientTransform?: string;
  /** SVG `gradientUnits` attribute. */
  gradientUnits?: string;
  /** SVG `hanging` attribute. */
  hanging?: number | string;
  /** SVG `horizAdvX` attribute. */
  horizAdvX?: number | string;
  /** SVG `horizOriginX` attribute. */
  horizOriginX?: number | string;
  /** SVG `href` attribute. */
  href?: string;
  /** SVG `ideographic` attribute. */
  ideographic?: number | string;
  /** SVG `imageRendering` attribute. */
  imageRendering?: number | string;
  /** SVG `in2` attribute. */
  in2?: number | string;
  /** SVG `in` attribute. */
  in?: string;
  /** SVG `intercept` attribute. */
  intercept?: number | string;
  /** SVG `k1` attribute. */
  k1?: number | string;
  /** SVG `k2` attribute. */
  k2?: number | string;
  /** SVG `k3` attribute. */
  k3?: number | string;
  /** SVG `k4` attribute. */
  k4?: number | string;
  /** SVG `k` attribute. */
  k?: number | string;
  /** SVG `kernelMatrix` attribute. */
  kernelMatrix?: number | string;
  /** SVG `kernelUnitLength` attribute. */
  kernelUnitLength?: number | string;
  /** SVG `kerning` attribute. */
  kerning?: number | string;
  /** SVG `keyPoints` attribute. */
  keyPoints?: number | string;
  /** SVG `keySplines` attribute. */
  keySplines?: number | string;
  /** SVG `keyTimes` attribute. */
  keyTimes?: number | string;
  /** SVG `lengthAdjust` attribute. */
  lengthAdjust?: number | string;
  /** SVG `letterSpacing` attribute. */
  letterSpacing?: number | string;
  /** SVG `lightingColor` attribute. */
  lightingColor?: number | string;
  /** SVG `limitingConeAngle` attribute. */
  limitingConeAngle?: number | string;
  /** SVG `local` attribute. */
  local?: number | string;
  /** SVG `markerEnd` attribute. */
  markerEnd?: string;
  /** SVG `markerHeight` attribute. */
  markerHeight?: number | string;
  /** SVG `markerMid` attribute. */
  markerMid?: string;
  /** SVG `markerStart` attribute. */
  markerStart?: string;
  /** SVG `markerUnits` attribute. */
  markerUnits?: number | string;
  /** SVG `markerWidth` attribute. */
  markerWidth?: number | string;
  /** SVG `mask` attribute. */
  mask?: string;
  /** SVG `maskContentUnits` attribute. */
  maskContentUnits?: number | string;
  /** SVG `maskUnits` attribute. */
  maskUnits?: number | string;
  /** SVG `mathematical` attribute. */
  mathematical?: number | string;
  /** SVG `mode` attribute. */
  mode?: number | string;
  /** SVG `numOctaves` attribute. */
  numOctaves?: number | string;
  /** SVG `offset` attribute. */
  offset?: number | string;
  /** SVG `opacity` attribute. */
  opacity?: number | string;
  /** SVG `operator` attribute. */
  operator?: number | string;
  /** SVG `order` attribute. */
  order?: number | string;
  /** SVG `orient` attribute. */
  orient?: number | string;
  /** SVG `orientation` attribute. */
  orientation?: number | string;
  /** SVG `origin` attribute. */
  origin?: number | string;
  /** SVG `overflow` attribute. */
  overflow?: number | string;
  /** SVG `overlinePosition` attribute. */
  overlinePosition?: number | string;
  /** SVG `overlineThickness` attribute. */
  overlineThickness?: number | string;
  /** SVG `paintOrder` attribute. */
  paintOrder?: number | string;
  /** SVG `panose1` attribute. */
  panose1?: number | string;
  /** SVG `path` attribute. */
  path?: string;
  /** SVG `pathLength` attribute. */
  pathLength?: number | string;
  /** SVG `patternContentUnits` attribute. */
  patternContentUnits?: string;
  /** SVG `patternTransform` attribute. */
  patternTransform?: number | string;
  /** SVG `patternUnits` attribute. */
  patternUnits?: string;
  /** SVG `pointerEvents` attribute. */
  pointerEvents?: number | string;
  /** SVG `points` attribute. */
  points?: string;
  /** SVG `pointsAtX` attribute. */
  pointsAtX?: number | string;
  /** SVG `pointsAtY` attribute. */
  pointsAtY?: number | string;
  /** SVG `pointsAtZ` attribute. */
  pointsAtZ?: number | string;
  /** SVG `preserveAlpha` attribute. */
  preserveAlpha?: boolean;
  /** SVG `preserveAspectRatio` attribute. */
  preserveAspectRatio?: string;
  /** SVG `primitiveUnits` attribute. */
  primitiveUnits?: number | string;
  /** SVG `r` attribute. */
  r?: number | string;
  /** SVG `radius` attribute. */
  radius?: number | string;
  /** SVG `refX` attribute. */
  refX?: number | string;
  /** SVG `refY` attribute. */
  refY?: number | string;
  /** SVG `renderingIntent` attribute. */
  renderingIntent?: number | string;
  /** SVG `repeatCount` attribute. */
  repeatCount?: number | string;
  /** SVG `repeatDur` attribute. */
  repeatDur?: number | string;
  /** SVG `requiredExtensions` attribute. */
  requiredExtensions?: number | string;
  /** SVG `requiredFeatures` attribute. */
  requiredFeatures?: number | string;
  /** SVG `restart` attribute. */
  restart?: number | string;
  /** SVG `result` attribute. */
  result?: string;
  /** SVG `rotate` attribute. */
  rotate?: number | string;
  /** SVG `rx` attribute. */
  rx?: number | string;
  /** SVG `ry` attribute. */
  ry?: number | string;
  /** SVG `scale` attribute. */
  scale?: number | string;
  /** SVG `seed` attribute. */
  seed?: number | string;
  /** SVG `shapeRendering` attribute. */
  shapeRendering?: number | string;
  /** SVG `slope` attribute. */
  slope?: number | string;
  /** SVG `spacing` attribute. */
  spacing?: number | string;
  /** SVG `specularConstant` attribute. */
  specularConstant?: number | string;
  /** SVG `specularExponent` attribute. */
  specularExponent?: number | string;
  /** SVG `speed` attribute. */
  speed?: number | string;
  /** SVG `spreadMethod` attribute. */
  spreadMethod?: string;
  /** SVG `startOffset` attribute. */
  startOffset?: number | string;
  /** SVG `stdDeviation` attribute. */
  stdDeviation?: number | string;
  /** SVG `stemh` attribute. */
  stemh?: number | string;
  /** SVG `stemv` attribute. */
  stemv?: number | string;
  /** SVG `stitchTiles` attribute. */
  stitchTiles?: number | string;
  /** SVG `stopColor` attribute. */
  stopColor?: string;
  /** SVG `stopOpacity` attribute. */
  stopOpacity?: number | string;
  /** SVG `strikethroughPosition` attribute. */
  strikethroughPosition?: number | string;
  /** SVG `strikethroughThickness` attribute. */
  strikethroughThickness?: number | string;
  /** SVG `string` attribute. */
  string?: number | string;
  /** SVG `stroke` attribute. */
  stroke?: string;
  /** SVG `strokeDasharray` attribute. */
  strokeDasharray?: string | number;
  /** SVG `strokeDashoffset` attribute. */
  strokeDashoffset?: string | number;
  /** SVG `strokeLinecap` attribute. */
  strokeLinecap?: "butt" | "round" | "square" | "inherit";
  /** SVG `strokeLinejoin` attribute. */
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
  /** SVG `strokeMiterlimit` attribute. */
  strokeMiterlimit?: number | string;
  /** SVG `strokeOpacity` attribute. */
  strokeOpacity?: number | string;
  /** SVG `strokeWidth` attribute. */
  strokeWidth?: number | string;
  /** SVG `surfaceScale` attribute. */
  surfaceScale?: number | string;
  /** SVG `systemLanguage` attribute. */
  systemLanguage?: number | string;
  /** SVG `tableValues` attribute. */
  tableValues?: number | string;
  /** SVG `targetX` attribute. */
  targetX?: number | string;
  /** SVG `targetY` attribute. */
  targetY?: number | string;
  /** SVG `textAnchor` attribute. */
  textAnchor?: "start" | "middle" | "end" | "inherit";
  /** SVG `textDecoration` attribute. */
  textDecoration?: number | string;
  /** SVG `textLength` attribute. */
  textLength?: number | string;
  /** SVG `textRendering` attribute. */
  textRendering?: number | string;
  /** SVG `to` attribute. */
  to?: number | string;
  /** SVG `transform` attribute. */
  transform?: string;
  /** SVG `u1` attribute. */
  u1?: number | string;
  /** SVG `u2` attribute. */
  u2?: number | string;
  /** SVG `underlinePosition` attribute. */
  underlinePosition?: number | string;
  /** SVG `underlineThickness` attribute. */
  underlineThickness?: number | string;
  /** SVG `unicode` attribute. */
  unicode?: number | string;
  /** SVG `unicodeBidi` attribute. */
  unicodeBidi?: number | string;
  /** SVG `unicodeRange` attribute. */
  unicodeRange?: number | string;
  /** SVG `unitsPerEm` attribute. */
  unitsPerEm?: number | string;
  /** SVG `vAlphabetic` attribute. */
  vAlphabetic?: number | string;
  /** SVG `values` attribute. */
  values?: string;
  /** SVG `vectorEffect` attribute. */
  vectorEffect?: number | string;
  /** SVG `version` attribute. */
  version?: string;
  /** SVG `vertAdvY` attribute. */
  vertAdvY?: number | string;
  /** SVG `vertOriginX` attribute. */
  vertOriginX?: number | string;
  /** SVG `vertOriginY` attribute. */
  vertOriginY?: number | string;
  /** SVG `vHanging` attribute. */
  vHanging?: number | string;
  /** SVG `vIdeographic` attribute. */
  vIdeographic?: number | string;
  /** SVG `viewBox` attribute. */
  viewBox?: string;
  /** SVG `viewTarget` attribute. */
  viewTarget?: number | string;
  /** SVG `visibility` attribute. */
  visibility?: number | string;
  /** SVG `vMathematical` attribute. */
  vMathematical?: number | string;
  /** SVG `widths` attribute. */
  widths?: number | string;
  /** SVG `wordSpacing` attribute. */
  wordSpacing?: number | string;
  /** SVG `writingMode` attribute. */
  writingMode?: number | string;
  /** SVG `x1` attribute. */
  x1?: number | string;
  /** SVG `x2` attribute. */
  x2?: number | string;
  /** SVG `x` attribute. */
  x?: number | string;
  /** SVG `xChannelSelector` attribute. */
  xChannelSelector?: string;
  /** SVG `xHeight` attribute. */
  xHeight?: number | string;
  /** SVG `xlinkActuate` attribute. */
  xlinkActuate?: string;
  /** SVG `xlinkArcrole` attribute. */
  xlinkArcrole?: string;
  /** SVG `xlinkHref` attribute. */
  xlinkHref?: string;
  /** SVG `xlinkRole` attribute. */
  xlinkRole?: string;
  /** SVG `xlinkShow` attribute. */
  xlinkShow?: string;
  /** SVG `xlinkTitle` attribute. */
  xlinkTitle?: string;
  /** SVG `xlinkType` attribute. */
  xlinkType?: string;
  /** SVG `xmlBase` attribute. */
  xmlBase?: string;
  /** SVG `xmlLang` attribute. */
  xmlLang?: string;
  /** SVG `xmlns` attribute. */
  xmlns?: string;
  /** SVG `xmlnsXlink` attribute. */
  xmlnsXlink?: string;
  /** SVG `xmlSpace` attribute. */
  xmlSpace?: string;
  /** SVG `y1` attribute. */
  y1?: number | string;
  /** SVG `y2` attribute. */
  y2?: number | string;
  /** SVG `y` attribute. */
  y?: number | string;
  /** SVG `yChannelSelector` attribute. */
  yChannelSelector?: string;
  /** SVG `z` attribute. */
  z?: number | string;
  /** SVG `zoomAndPan` attribute. */
  zoomAndPan?: string;
}
