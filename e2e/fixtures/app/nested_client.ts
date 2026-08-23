import { stamp } from "./stamp.ts";

customElements.define(
  "nested-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "nested-ran");
    }
  },
);
