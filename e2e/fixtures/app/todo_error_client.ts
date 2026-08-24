import { stamp } from "./stamp.ts";

customElements.define(
  "todo-error-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "error-upgraded");
    }
  },
);
