import { stamp } from "../stamp.ts";

customElements.define(
  "eager-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "eager-ran");
    }
  },
);
