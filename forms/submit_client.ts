export interface SubmitIntent {
  readonly method: string;
  readonly url: string;
  readonly body: FormData | URLSearchParams;
}

const writeHosts = new Map<
  string,
  (host: Element, intent: SubmitIntent) => void
>();
let softNavigate: ((url: string) => void) | null = null;
let listening = false;

function urlEncoded(formData: FormData): URLSearchParams {
  return new URLSearchParams(
    [...formData].filter((entry): entry is [string, string] =>
      typeof entry[1] === "string"
    ),
  );
}

function onSubmit(event: Event): void {
  if (event.defaultPrevented) {
    return;
  }
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  const form = event.target;
  const submitter = event instanceof SubmitEvent ? event.submitter : null;
  const formControl = submitter instanceof HTMLButtonElement ||
      submitter instanceof HTMLInputElement
    ? submitter
    : null;
  if (
    form.hasAttribute("hardnavigation") ||
    formControl?.hasAttribute("hardnavigation")
  ) {
    return;
  }
  const method = formControl?.formMethod || form.method;
  if (method === "dialog") {
    return;
  }
  const action = formControl?.hasAttribute("formaction")
    ? formControl.formAction
    : form.action;
  const target = formControl?.hasAttribute("formtarget")
    ? formControl.formTarget
    : form.target;
  if (target !== "" || new URL(action).origin !== location.origin) {
    return;
  }
  if (method === "get") {
    if (softNavigate === null) {
      return;
    }
    event.preventDefault();
    const formData = formControl !== null
      ? new FormData(form, formControl)
      : new FormData(form);
    const dest = new URL(action);
    dest.search = urlEncoded(formData).toString();
    softNavigate(dest.href);
    return;
  }
  if (writeHosts.size === 0) {
    return;
  }
  const host = form.closest([...writeHosts.keys()].join(", "));
  if (host === null) {
    return;
  }
  event.preventDefault();
  const submit = writeHosts.get(host.localName);
  if (submit === undefined) {
    return;
  }
  const formData = formControl !== null
    ? new FormData(form, formControl)
    : new FormData(form);
  const body = form.enctype === "multipart/form-data"
    ? formData
    : urlEncoded(formData);
  submit(host, { method, url: action, body });
}

function ensureListener(): void {
  if (listening) {
    return;
  }
  listening = true;
  document.addEventListener("submit", onSubmit);
}

export function registerWriteHost(
  tag: string,
  submit: (host: Element, intent: SubmitIntent) => void,
): void {
  writeHosts.set(tag, submit);
  ensureListener();
}

export function registerSoftNavigate(navigate: (url: string) => void): void {
  softNavigate = navigate;
  ensureListener();
}

/** Leave the current page for `url`: soft when navigation loaded, else a real load. */
export function leaveFor(url: string): void {
  if (softNavigate !== null) {
    softNavigate(url);
    return;
  }
  location.assign(url);
}
