import { navigate, submitWrite } from "../client/registry_client.ts";

function urlEncoded(formData: FormData): URLSearchParams {
  const params = new URLSearchParams();
  for (const [name, value] of formData) {
    params.append(name, typeof value === "string" ? value : value.name);
  }
  return params;
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
    event.preventDefault();
    const formData = formControl !== null
      ? new FormData(form, formControl)
      : new FormData(form);
    const dest = new URL(action);
    dest.search = urlEncoded(formData).toString();
    void navigate(dest.href);
    return;
  }
  if (form.hasAttribute("aria-busy")) {
    event.preventDefault();
    return;
  }
  event.preventDefault();
  const formData = formControl !== null
    ? new FormData(form, formControl)
    : new FormData(form);
  const body = form.enctype === "multipart/form-data"
    ? formData
    : urlEncoded(formData);
  form.setAttribute("aria-busy", "true");
  void submitWrite({ method, url: action, body }).finally(() => {
    form.removeAttribute("aria-busy");
  });
}

document.addEventListener("submit", onSubmit);
