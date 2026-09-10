import { stamp } from "../stamp.ts";

customElements.define(
  "stamped-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "stamped-ran");
    }
  },
);
