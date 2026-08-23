import { stamp } from "./stamp.ts";

customElements.define(
  "lazy-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "lazy-ran");
    }
  },
);
