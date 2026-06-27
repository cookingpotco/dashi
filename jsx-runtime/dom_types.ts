interface EventBase<C extends EventTarget, T extends EventTarget> {
  currentTarget: EventTarget & C;
  target: T;
}

export type EventHandler<
  C extends EventTarget = EventTarget,
  E extends Event = Event,
  T extends EventTarget = EventTarget,
> = (
  event: E & EventBase<C, T>,
) => void;

export type ClipboardEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    ClipboardEvent
  >;
export type CompositionEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<T, CompositionEvent>;
export type DragEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    DragEvent
  >;
export type FocusEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    FocusEvent
  >;
export type InputEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    InputEvent
  >;
export type KeyboardEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    KeyboardEvent
  >;
export type MouseEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    MouseEvent
  >;
export type SubmitEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    SubmitEvent
  >;
export type TouchEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    TouchEvent
  >;
export type PointerEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    PointerEvent
  >;
export type UIEventHandler<T extends EventTarget = EventTarget> = EventHandler<
  T,
  UIEvent
>;
export type WheelEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    WheelEvent
  >;
export type AnimationEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    AnimationEvent
  >;
export type ToggleEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    ToggleEvent
  >;
export type TransitionEventHandler<T extends EventTarget = EventTarget> =
  EventHandler<
    T,
    TransitionEvent
  >;

export type Node = string | number | bigint | boolean | null;

export interface DOMAttributes<T extends EventTarget> {
  children?: Node | Node[];

  // Clipboard Events
  onCopy?: ClipboardEventHandler<T>;
  onCopyCapture?: ClipboardEventHandler<T>;
  onCut?: ClipboardEventHandler<T>;
  onCutCapture?: ClipboardEventHandler<T>;
  onPaste?: ClipboardEventHandler<T>;
  onPasteCapture?: ClipboardEventHandler<T>;

  // Composition Events
  onCompositionEnd?: CompositionEventHandler<T>;
  onCompositionEndCapture?: CompositionEventHandler<T>;
  onCompositionStart?: CompositionEventHandler<T>;
  onCompositionStartCapture?: CompositionEventHandler<T>;
  onCompositionUpdate?: CompositionEventHandler<T>;
  onCompositionUpdateCapture?: CompositionEventHandler<T>;

  // Focus Events
  onFocus?: FocusEventHandler<T>;
  onFocusCapture?: FocusEventHandler<T>;
  onBlur?: FocusEventHandler<T>;
  onBlurCapture?: FocusEventHandler<T>;

  // form related Events
  onChange?: EventHandler<T>;
  onChangeCapture?: EventHandler<T>;
  onBeforeInput?: InputEventHandler<T>;
  onBeforeInputCapture?: InputEventHandler<T>;
  onInput?: InputEventHandler<T>;
  onInputCapture?: InputEventHandler<T>;
  onReset?: EventHandler<T>;
  onResetCapture?: EventHandler<T>;
  onSubmit?: SubmitEventHandler<T>;
  onSubmitCapture?: SubmitEventHandler<T>;
  onInvalid?: EventHandler<T>;
  onInvalidCapture?: EventHandler<T>;

  // Image Events
  onLoad?: EventHandler<T>;
  onLoadCapture?: EventHandler<T>;
  onError?: EventHandler<T>; // also a Media Event
  onErrorCapture?: EventHandler<T>; // also a Media Event

  // Keyboard Events
  onKeyDown?: KeyboardEventHandler<T>;
  onKeyDownCapture?: KeyboardEventHandler<T>;
  /** @deprecated Use `onKeyUp` or `onKeyDown` instead */
  onKeyPress?: KeyboardEventHandler<T>;
  /** @deprecated Use `onKeyUpCapture` or `onKeyDownCapture` instead */
  onKeyPressCapture?: KeyboardEventHandler<T>;
  onKeyUp?: KeyboardEventHandler<T>;
  onKeyUpCapture?: KeyboardEventHandler<T>;

  // Media Events
  onAbort?: EventHandler<T>;
  onAbortCapture?: EventHandler<T>;
  onCanPlay?: EventHandler<T>;
  onCanPlayCapture?: EventHandler<T>;
  onCanPlayThrough?: EventHandler<T>;
  onCanPlayThroughCapture?: EventHandler<T>;
  onDurationChange?: EventHandler<T>;
  onDurationChangeCapture?: EventHandler<T>;
  onEmptied?: EventHandler<T>;
  onEmptiedCapture?: EventHandler<T>;
  onEncrypted?: EventHandler<T>;
  onEncryptedCapture?: EventHandler<T>;
  onEnded?: EventHandler<T>;
  onEndedCapture?: EventHandler<T>;
  onLoadedData?: EventHandler<T>;
  onLoadedDataCapture?: EventHandler<T>;
  onLoadedMetadata?: EventHandler<T>;
  onLoadedMetadataCapture?: EventHandler<T>;
  onLoadStart?: EventHandler<T>;
  onLoadStartCapture?: EventHandler<T>;
  onPause?: EventHandler<T>;
  onPauseCapture?: EventHandler<T>;
  onPlay?: EventHandler<T>;
  onPlayCapture?: EventHandler<T>;
  onPlaying?: EventHandler<T>;
  onPlayingCapture?: EventHandler<T>;
  onProgress?: EventHandler<T>;
  onProgressCapture?: EventHandler<T>;
  onRateChange?: EventHandler<T>;
  onRateChangeCapture?: EventHandler<T>;
  onSeeked?: EventHandler<T>;
  onSeekedCapture?: EventHandler<T>;
  onSeeking?: EventHandler<T>;
  onSeekingCapture?: EventHandler<T>;
  onStalled?: EventHandler<T>;
  onStalledCapture?: EventHandler<T>;
  onSuspend?: EventHandler<T>;
  onSuspendCapture?: EventHandler<T>;
  onTimeUpdate?: EventHandler<T>;
  onTimeUpdateCapture?: EventHandler<T>;
  onVolumeChange?: EventHandler<T>;
  onVolumeChangeCapture?: EventHandler<T>;
  onWaiting?: EventHandler<T>;
  onWaitingCapture?: EventHandler<T>;

  // MouseEvents
  onAuxClick?: MouseEventHandler<T>;
  onAuxClickCapture?: MouseEventHandler<T>;
  onClick?: MouseEventHandler<T>;
  onClickCapture?: MouseEventHandler<T>;
  onContextMenu?: MouseEventHandler<T>;
  onContextMenuCapture?: MouseEventHandler<T>;
  onDoubleClick?: MouseEventHandler<T>;
  onDoubleClickCapture?: MouseEventHandler<T>;
  onDrag?: DragEventHandler<T>;
  onDragCapture?: DragEventHandler<T>;
  onDragEnd?: DragEventHandler<T>;
  onDragEndCapture?: DragEventHandler<T>;
  onDragEnter?: DragEventHandler<T>;
  onDragEnterCapture?: DragEventHandler<T>;
  onDragExit?: DragEventHandler<T>;
  onDragExitCapture?: DragEventHandler<T>;
  onDragLeave?: DragEventHandler<T>;
  onDragLeaveCapture?: DragEventHandler<T>;
  onDragOver?: DragEventHandler<T>;
  onDragOverCapture?: DragEventHandler<T>;
  onDragStart?: DragEventHandler<T>;
  onDragStartCapture?: DragEventHandler<T>;
  onDrop?: DragEventHandler<T>;
  onDropCapture?: DragEventHandler<T>;
  onMouseDown?: MouseEventHandler<T>;
  onMouseDownCapture?: MouseEventHandler<T>;
  onMouseEnter?: MouseEventHandler<T>;
  onMouseLeave?: MouseEventHandler<T>;
  onMouseMove?: MouseEventHandler<T>;
  onMouseMoveCapture?: MouseEventHandler<T>;
  onMouseOut?: MouseEventHandler<T>;
  onMouseOutCapture?: MouseEventHandler<T>;
  onMouseOver?: MouseEventHandler<T>;
  onMouseOverCapture?: MouseEventHandler<T>;
  onMouseUp?: MouseEventHandler<T>;
  onMouseUpCapture?: MouseEventHandler<T>;

  // Selection Events
  onSelect?: EventHandler<T>;
  onSelectCapture?: EventHandler<T>;

  // Touch Events
  onTouchCancel?: TouchEventHandler<T>;
  onTouchCancelCapture?: TouchEventHandler<T>;
  onTouchEnd?: TouchEventHandler<T>;
  onTouchEndCapture?: TouchEventHandler<T>;
  onTouchMove?: TouchEventHandler<T>;
  onTouchMoveCapture?: TouchEventHandler<T>;
  onTouchStart?: TouchEventHandler<T>;
  onTouchStartCapture?: TouchEventHandler<T>;

  // Pointer Events
  onPointerDown?: PointerEventHandler<T>;
  onPointerDownCapture?: PointerEventHandler<T>;
  onPointerMove?: PointerEventHandler<T>;
  onPointerMoveCapture?: PointerEventHandler<T>;
  onPointerUp?: PointerEventHandler<T>;
  onPointerUpCapture?: PointerEventHandler<T>;
  onPointerCancel?: PointerEventHandler<T>;
  onPointerCancelCapture?: PointerEventHandler<T>;
  onPointerEnter?: PointerEventHandler<T>;
  onPointerLeave?: PointerEventHandler<T>;
  onPointerOver?: PointerEventHandler<T>;
  onPointerOverCapture?: PointerEventHandler<T>;
  onPointerOut?: PointerEventHandler<T>;
  onPointerOutCapture?: PointerEventHandler<T>;
  onGotPointerCapture?: PointerEventHandler<T>;
  onGotPointerCaptureCapture?: PointerEventHandler<T>;
  onLostPointerCapture?: PointerEventHandler<T>;
  onLostPointerCaptureCapture?: PointerEventHandler<T>;

  // UI Events
  onScroll?: UIEventHandler<T>;
  onScrollCapture?: UIEventHandler<T>;
  onScrollEnd?: UIEventHandler<T>;
  onScrollEndCapture?: UIEventHandler<T>;

  // Wheel Events
  onWheel?: WheelEventHandler<T>;
  onWheelCapture?: WheelEventHandler<T>;

  // Animation Events
  onAnimationStart?: AnimationEventHandler<T>;
  onAnimationStartCapture?: AnimationEventHandler<T>;
  onAnimationEnd?: AnimationEventHandler<T>;
  onAnimationEndCapture?: AnimationEventHandler<T>;
  onAnimationIteration?: AnimationEventHandler<T>;
  onAnimationIterationCapture?: AnimationEventHandler<T>;

  // Toggle Events
  onToggle?: ToggleEventHandler<T>;
  onBeforeToggle?: ToggleEventHandler<T>;

  // Transition Events
  onTransitionCancel?: TransitionEventHandler<T>;
  onTransitionCancelCapture?: TransitionEventHandler<T>;
  onTransitionEnd?: TransitionEventHandler<T>;
  onTransitionEndCapture?: TransitionEventHandler<T>;
  onTransitionRun?: TransitionEventHandler<T>;
  onTransitionRunCapture?: TransitionEventHandler<T>;
  onTransitionStart?: TransitionEventHandler<T>;
  onTransitionStartCapture?: TransitionEventHandler<T>;
}
// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
export interface AriaAttributes {
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  "aria-activedescendant"?: string;
  /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
  "aria-atomic"?: boolean;
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  "aria-autocomplete"?: "none" | "inline" | "list" | "both";
  /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
  /**
   * Defines a string value that labels the current element, which is intended to be converted into Braille.
   * @see aria-label.
   */
  "aria-braillelabel"?: string;
  /**
   * Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille.
   * @see aria-roledescription.
   */
  "aria-brailleroledescription"?: string;
  "aria-busy"?: boolean;
  /**
   * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
   * @see aria-pressed @see aria-selected.
   */
  "aria-checked"?: boolean | "false" | "mixed" | "true";
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   * @see aria-colindex.
   */
  "aria-colcount"?: number;
  /**
   * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
   * @see aria-colcount @see aria-colspan.
   */
  "aria-colindex"?: number;
  /**
   * Defines a human readable text alternative of aria-colindex.
   * @see aria-rowindextext.
   */
  "aria-colindextext"?: string;
  /**
   * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-colindex @see aria-rowspan.
   */
  "aria-colspan"?: number;
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   * @see aria-owns.
   */
  "aria-controls"?: string;
  /** Indicates the element that represents the current item within a container or set of related elements. */
  "aria-current"?:
    | boolean
    | "false"
    | "true"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
  /**
   * Identifies the element (or elements) that describes the object.
   * @see aria-labelledby
   */
  "aria-describedby"?: string;
  /**
   * Defines a string value that describes or annotates the current element.
   * @see related aria-describedby.
   */
  "aria-description"?: string;
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   * @see aria-describedby.
   */
  "aria-details"?: string;
  /**
   * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
   * @see aria-hidden @see aria-readonly.
   */
  "aria-disabled"?: boolean;
  /**
   * Indicates what functions can be performed when a dragged object is released on the drop target.
   * @deprecated in ARIA 1.1
   */
  "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup";
  /**
   * Identifies the element that provides an error message for the object.
   * @see aria-invalid @see aria-describedby.
   */
  "aria-errormessage"?: string;
  /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
  "aria-expanded"?: boolean;
  /**
   * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
   * allows assistive technology to override the general default of reading in document source order.
   */
  "aria-flowto"?: string;
  /**
   * Indicates an element's "grabbed" state in a drag-and-drop operation.
   * @deprecated in ARIA 1.1
   */
  "aria-grabbed"?: boolean;
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  "aria-haspopup"?:
    | boolean
    | "false"
    | "true"
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";
  /**
   * Indicates whether the element is exposed to an accessibility API.
   * @see aria-disabled.
   */
  "aria-hidden"?: boolean;
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   * @see aria-errormessage.
   */
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling";
  /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
  "aria-keyshortcuts"?: string;
  /**
   * Defines a string value that labels the current element.
   * @see aria-labelledby.
   */
  "aria-label"?: string;
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see aria-describedby.
   */
  "aria-labelledby"?: string;
  /** Defines the hierarchical level of an element within a structure. */
  "aria-level"?: number;
  /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
  "aria-live"?: "off" | "assertive" | "polite";
  /** Indicates whether an element is modal when displayed. */
  "aria-modal"?: boolean;
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  "aria-multiline"?: boolean;
  /** Indicates that the user may select more than one item from the current selectable descendants. */
  "aria-multiselectable"?: boolean;
  /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
  "aria-orientation"?: "horizontal" | "vertical";
  /**
   * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
   * @see aria-controls.
   */
  "aria-owns"?: string;
  /**
   * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
   * A hint could be a sample value or a brief description of the expected format.
   */
  "aria-placeholder"?: string;
  /**
   * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-setsize.
   */
  "aria-posinset"?: number;
  /**
   * Indicates the current "pressed" state of toggle buttons.
   * @see aria-checked @see aria-selected.
   */
  "aria-pressed"?: boolean | "false" | "mixed" | "true";
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   * @see aria-disabled.
   */
  "aria-readonly"?: boolean;
  /**
   * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
   * @see aria-atomic.
   */
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
  /** Indicates that user input is required on the element before a form may be submitted. */
  "aria-required"?: boolean;
  /** Defines a human-readable, author-localized description for the role of an element. */
  "aria-roledescription"?: string;
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   * @see aria-rowindex.
   */
  "aria-rowcount"?: number;
  /**
   * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
   * @see aria-rowcount @see aria-rowspan.
   */
  "aria-rowindex"?: number;
  /**
   * Defines a human readable text alternative of aria-rowindex.
   * @see aria-colindextext.
   */
  "aria-rowindextext"?: string;
  /**
   * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
   * @see aria-rowindex @see aria-colspan.
   */
  "aria-rowspan"?: number;
  /**
   * Indicates the current "selected" state of various widgets.
   * @see aria-checked @see aria-pressed.
   */
  "aria-selected"?: boolean;
  /**
   * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-posinset.
   */
  "aria-setsize"?: number;
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  "aria-sort"?: "none" | "ascending" | "descending" | "other";
  /** Defines the maximum allowed value for a range widget. */
  "aria-valuemax"?: number;
  /** Defines the minimum allowed value for a range widget. */
  "aria-valuemin"?: number;
  /**
   * Defines the current value for a range widget.
   * @see aria-valuetext.
   */
  "aria-valuenow"?: number;
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  "aria-valuetext"?: string;
}

// All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
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
  | (string & {});

export interface HTMLAttributes<T extends HTMLElement>
  extends AriaAttributes, DOMAttributes<T> {
  // Standard HTML Attributes
  accessKey?: string;
  autoCapitalize?:
    | "off"
    | "none"
    | "on"
    | "sentences"
    | "words"
    | "characters"
    | (string & {});
  autoFocus?: boolean;
  className?: string;
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
  id?: string;
  lang?: string;
  nonce?: string;
  slot?: string;
  spellCheck?: boolean;
  tabIndex?: number;
  title?: string;
  translate?: "yes" | "no";

  // Unknown
  radioGroup?: string; // <command>, <menuitem>

  // WAI-ARIA
  role?: AriaRole;

  // RDFa Attributes
  about?: string;
  content?: string;
  datatype?: string;
  inlist?: unknown;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;

  // Non-standard Attributes
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  results?: number;
  security?: string;
  unselectable?: "on" | "off";

  // Popover API
  popover?: "" | "auto" | "manual" | "hint";
  popoverTargetAction?: "toggle" | "show" | "hide";
  popoverTarget?: string;

  // Living Standard
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert}
   */
  inert?: boolean;
  /**
   * Hints at the type of data that might be entered by the user while editing the element or its contents
   * @see {@link https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute}
   */
  inputMode?:
    | "none"
    | "text"
    | "tel"
    | "url"
    | "email"
    | "numeric"
    | "decimal"
    | "search";
  /**
   * Specify that a standard HTML element should behave like a defined custom built-in element
   * @see {@link https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is}
   */
  is?: string;
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/exportparts}
   */
  exportparts?: string;
  /**
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/part}
   */
  part?: string;
}

export type InternalSrc = `/${string}`;

export interface RouteFragmentAttributes extends HTMLAttributes<HTMLElement> {
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
  | (string & {});

export interface AnchorHTMLAttributes
  extends HTMLAttributes<HTMLAnchorElement> {
  download?: string;
  href?: string;
  hrefLang?: string;
  media?: string;
  ping?: string;
  target?: HTMLAttributeAnchorTarget;
  type?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
}

export interface AudioHTMLAttributes
  extends MediaHTMLAttributes<HTMLAudioElement> {}

export interface AreaHTMLAttributes extends HTMLAttributes<HTMLAreaElement> {
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

export interface BaseHTMLAttributes extends HTMLAttributes<HTMLBaseElement> {
  href?: string;
  target?: string;
}

export interface BlockquoteHTMLAttributes
  extends HTMLAttributes<HTMLQuoteElement> {
  cite?: string;
}

export interface ButtonHTMLAttributes
  extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  type?: "submit" | "reset" | "button";
  value?: string | readonly string[] | number;
}

export interface CanvasHTMLAttributes
  extends HTMLAttributes<HTMLCanvasElement> {
  height?: number | string;
  width?: number | string;
}

export interface ColHTMLAttributes extends HTMLAttributes<HTMLTableColElement> {
  span?: number;
  width?: number | string;
}

export interface ColgroupHTMLAttributes
  extends HTMLAttributes<HTMLTableColElement> {
  span?: number;
}

export interface DataHTMLAttributes extends HTMLAttributes<HTMLDataElement> {
  value?: string | readonly string[] | number;
}

export interface DetailsHTMLAttributes
  extends HTMLAttributes<HTMLDetailsElement> {
  open?: boolean;
  name?: string;
}

export interface DelHTMLAttributes extends HTMLAttributes<HTMLModElement> {
  cite?: string;
  dateTime?: string;
}

export interface DialogHTMLAttributes
  extends HTMLAttributes<HTMLDialogElement> {
  closedby?: "any" | "closerequest" | "none";
  onCancel?: EventHandler<HTMLDialogElement>;
  onClose?: EventHandler<HTMLDialogElement>;
  open?: boolean;
}

export interface EmbedHTMLAttributes extends HTMLAttributes<HTMLEmbedElement> {
  height?: number | string;
  src?: string;
  type?: string;
  width?: number | string;
}

export interface FieldsetHTMLAttributes
  extends HTMLAttributes<HTMLFieldSetElement> {
  disabled?: boolean;
  form?: string;
  name?: string;
}

export interface FormHTMLAttributes extends HTMLAttributes<HTMLFormElement> {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  encType?: string;
  method?: string;
  name?: string;
  noValidate?: boolean;
  target?: string;
}

export interface HtmlHTMLAttributes extends HTMLAttributes<HTMLHtmlElement> {
  manifest?: string;
}

export interface IframeHTMLAttributes
  extends HTMLAttributes<HTMLIFrameElement> {
  allow?: string;
  allowFullScreen?: boolean;
  allowTransparency?: boolean;
  /** @deprecated */
  frameBorder?: number | string;
  height?: number | string;
  loading?: "eager" | "lazy";
  /** @deprecated */
  marginHeight?: number;
  /** @deprecated */
  marginWidth?: number;
  name?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  sandbox?: string;
  /** @deprecated */
  scrolling?: string;
  seamless?: boolean;
  src?: string;
  srcDoc?: string;
  width?: number | string;
}

export type CrossOrigin = "anonymous" | "use-credentials" | "" | undefined;

export interface ImgHTMLAttributes extends HTMLAttributes<HTMLImageElement> {
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

export interface InsHTMLAttributes<T extends HTMLElement>
  extends HTMLAttributes<T> {
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
  | (string & {});

export type AutoFillAddressKind = "billing" | "shipping";
export type AutoFillBase = "" | "off" | "on";
export type AutoFillContactField =
  | "email"
  | "tel"
  | "tel-area-code"
  | "tel-country-code"
  | "tel-extension"
  | "tel-local"
  | "tel-local-prefix"
  | "tel-local-suffix"
  | "tel-national";
export type AutoFillContactKind = "home" | "mobile" | "work";
export type AutoFillCredentialField = "webauthn";
export type AutoFillNormalField =
  | "additional-name"
  | "address-level1"
  | "address-level2"
  | "address-level3"
  | "address-level4"
  | "address-line1"
  | "address-line2"
  | "address-line3"
  | "bday-day"
  | "bday-month"
  | "bday-year"
  | "cc-csc"
  | "cc-exp"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-family-name"
  | "cc-given-name"
  | "cc-name"
  | "cc-number"
  | "cc-type"
  | "country"
  | "country-name"
  | "current-password"
  | "family-name"
  | "given-name"
  | "honorific-prefix"
  | "honorific-suffix"
  | "name"
  | "new-password"
  | "one-time-code"
  | "organization"
  | "postal-code"
  | "street-address"
  | "transaction-amount"
  | "transaction-currency"
  | "username";
export type OptionalPrefixToken<T extends string> = `${T} ` | "";
export type OptionalPostfixToken<T extends string> = ` ${T}` | "";
export type AutoFillField =
  | AutoFillNormalField
  | `${OptionalPrefixToken<AutoFillContactKind>}${AutoFillContactField}`;
export type AutoFillSection = `section-${string}`;
export type AutoFill =
  | AutoFillBase
  | `${OptionalPrefixToken<AutoFillSection>}${OptionalPrefixToken<
    AutoFillAddressKind
  >}${AutoFillField}${OptionalPostfixToken<AutoFillCredentialField>}`;
export type HTMLInputAutoCompleteAttribute = AutoFill | (string & {});

export interface InputHTMLAttributes
  extends Omit<HTMLAttributes<HTMLInputElement>, "onChange"> {
  accept?: string;
  alt?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  capture?: boolean | "user" | "environment"; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
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
  value?: string | readonly string[] | number;
  width?: number | string;

  // No other element dispatching change events can be nested in a <input>
  // so we know the target will be a HTMLInputElement.
  onChange?: EventHandler<HTMLInputElement, Event, HTMLInputElement>;
}

export interface KeygenHTMLAttributes extends HTMLAttributes<HTMLElement> {
  challenge?: string;
  disabled?: boolean;
  form?: string;
  keyType?: string;
  keyParams?: string;
  name?: string;
}

export interface LabelHTMLAttributes extends HTMLAttributes<HTMLLabelElement> {
  form?: string;
  htmlFor?: string;
}

export interface LiHTMLAttributes extends HTMLAttributes<HTMLLIElement> {
  value?: string | readonly string[] | number;
}

export interface LinkHTMLAttributes extends HTMLAttributes<HTMLLinkElement> {
  as?: string;
  blocking?: "render" | (string & {});
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

  // React props
  precedence?: string;
}

export interface MapHTMLAttributes extends HTMLAttributes<HTMLMapElement> {
  name?: string;
}

export interface MenuHTMLAttributes extends HTMLAttributes<HTMLMenuElement> {
  type?: string;
}

export interface MediaHTMLAttributes<T extends HTMLMediaElement>
  extends HTMLAttributes<T> {
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

export interface MetaHTMLAttributes extends HTMLAttributes<HTMLMetaElement> {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  media?: string;
  name?: string;
}

export interface MeterHTMLAttributes extends HTMLAttributes<HTMLMeterElement> {
  form?: string;
  high?: number;
  low?: number;
  max?: number | string;
  min?: number | string;
  optimum?: number;
  value?: string | readonly string[] | number;
}

export interface QuoteHTMLAttributes extends HTMLAttributes<HTMLQuoteElement> {
  cite?: string;
}

export interface ObjectHTMLAttributes
  extends HTMLAttributes<HTMLObjectElement> {
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

export interface OlHTMLAttributes extends HTMLAttributes<HTMLOListElement> {
  reversed?: boolean;
  start?: number;
  type?: "1" | "a" | "A" | "i" | "I";
}

export interface OptgroupHTMLAttributes
  extends HTMLAttributes<HTMLOptGroupElement> {
  disabled?: boolean;
  label?: string;
}

export interface OptionHTMLAttributes
  extends HTMLAttributes<HTMLOptionElement> {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | readonly string[] | number;
}

export interface OutputHTMLAttributes
  extends HTMLAttributes<HTMLOutputElement> {
  form?: string;
  htmlFor?: string;
  name?: string;
}

export interface ProgressHTMLAttributes
  extends HTMLAttributes<HTMLProgressElement> {
  max?: number | string;
  value?: string | readonly string[] | number;
}

export interface SlotHTMLAttributes extends HTMLAttributes<HTMLSlotElement> {
  name?: string;
}

export interface ScriptHTMLAttributes
  extends Omit<HTMLAttributes<HTMLScriptElement>, "onChange"> {
  async?: boolean;
  blocking?: "render" | (string & {});
  /** @deprecated */
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

export interface SelectHTMLAttributes
  extends Omit<HTMLAttributes<HTMLSelectElement>, "onChange"> {
  autoComplete?: string;
  disabled?: boolean;
  form?: string;
  multiple?: boolean;
  name?: string;
  required?: boolean;
  size?: number;
  value?: string | readonly string[] | number;
  // No other element dispatching change events can be nested in a <select>
  // so we know the target will be a HTMLSelectElement.
  onChange?: EventHandler<HTMLSelectElement, Event, HTMLSelectElement>;
}

export interface SourceHTMLAttributes
  extends HTMLAttributes<HTMLSourceElement> {
  height?: number | string;
  media?: string;
  sizes?: string;
  src?: string;
  srcSet?: string;
  type?: string;
  width?: number | string;
}

export interface StyleHTMLAttributes extends HTMLAttributes<HTMLStyleElement> {
  blocking?: "render" | (string & {});
  media?: string;
  scoped?: boolean;
  type?: string;
}

export interface TableHTMLAttributes extends HTMLAttributes<HTMLTableElement> {
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

export interface TextareaHTMLAttributes
  extends Omit<HTMLAttributes<HTMLTextAreaElement>, "onChange"> {
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
  value?: string | readonly string[] | number;
  wrap?: string;

  // No other element dispatching change events can be nested in a <textarea>
  // so we know the target will be a HTMLTextAreaElement.
  onChange?: EventHandler<HTMLTextAreaElement, Event, HTMLTextAreaElement>;
}

export interface TdHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
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

export interface ThHTMLAttributes extends HTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right" | "justify" | "char";
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: string;
  abbr?: string;
}

export interface TimeHTMLAttributes extends HTMLAttributes<HTMLTimeElement> {
  dateTime?: string;
}

export interface TrackHTMLAttributes extends HTMLAttributes<HTMLTrackElement> {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srcLang?: string;
}

export interface VideoHTMLAttributes
  extends MediaHTMLAttributes<HTMLVideoElement> {
  height?: number | string;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  disablePictureInPicture?: boolean;
  disableRemotePlayback?: boolean;

  onResize?: EventHandler<HTMLVideoElement>;
  onResizeCapture?: EventHandler<HTMLVideoElement>;
}

// this list is "complete" in that it contains every SVG attribute
// that React supports, but the types can be improved.
// Full list here: https://facebook.github.io/react/docs/dom-elements.html
//
// The three broad type categories are (in order of restrictiveness):
//   - "number | string"
//   - "string"
//   - union of string literals
export interface SVGAttributes<T extends SVGElement>
  extends AriaAttributes, DOMAttributes<T> {
  // React-specific Attributes
  suppressHydrationWarning?: boolean;

  // Attributes which also defined in HTMLAttributes
  // See comment in SVGDOMPropertyConfig.js
  className?: string;
  color?: string;
  height?: number | string;
  id?: string;
  lang?: string;
  max?: number | string;
  media?: string;
  method?: string;
  min?: number | string;
  name?: string;
  nonce?: string;
  part?: string;
  slot?: string;
  target?: string;
  type?: string;
  width?: number | string;

  // Other HTML properties supported by SVG elements in browsers
  role?: AriaRole;
  tabIndex?: number;
  crossOrigin?: CrossOrigin;

  // SVG Specific attributes
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
  colorInterpolationFilters?:
    | "auto"
    | "sRGB"
    | "linearRGB"
    | "inherit";
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

export interface WebViewHTMLAttributes extends HTMLAttributes<HTMLElement> {
  allowFullScreen?: boolean;
  allowpopups?: boolean;
  autosize?: boolean;
  blinkfeatures?: string;
  disableblinkfeatures?: string;
  disableguestresize?: boolean;
  disablewebsecurity?: boolean;
  guestinstance?: string;
  httpreferrer?: string;
  nodeintegration?: boolean;
  partition?: string;
  plugins?: boolean;
  preload?: string;
  src?: string;
  useragent?: string;
  webpreferences?: string;
}
