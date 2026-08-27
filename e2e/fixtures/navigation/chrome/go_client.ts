import { navigate } from "dashi/client";

customElements.define(
  "go-about",
  class extends HTMLElement {
    constructor() {
      super();
      this.addEventListener("click", () => {
        void navigate("/about");
      });
    }
  },
);
