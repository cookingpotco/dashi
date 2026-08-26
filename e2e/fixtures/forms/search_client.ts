const key = "__dashiSearchEvals";
Reflect.set(globalThis, key, Number(Reflect.get(globalThis, key) ?? 0) + 1);

customElements.define(
  "search-el",
  class extends HTMLElement {
    connectedCallback() {
      this.textContent = "search-upgraded";
    }
  },
);
