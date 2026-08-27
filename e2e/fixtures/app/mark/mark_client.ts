import { stamp } from "../stamp.ts";

customElements.define(
  "mark-el",
  class extends HTMLElement {
    connectedCallback() {
      stamp(this, "from-lib");
    }
  },
);
