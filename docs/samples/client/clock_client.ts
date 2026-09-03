customElements.define(
  "dashi-clock",
  class extends HTMLElement {
    #timer: ReturnType<typeof setInterval> | undefined;

    connectedCallback() {
      const tick = () => {
        this.textContent = new Date().toLocaleTimeString();
      };
      tick();
      this.#timer = setInterval(tick, 1000);
    }

    disconnectedCallback() {
      if (this.#timer !== undefined) {
        clearInterval(this.#timer);
      }
    }
  },
);
