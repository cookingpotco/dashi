import { Route } from "dashi";

export class FragmentRoute implements Route {
  async render() {
    const res = await fetch(new URL("https://bored-api.appbrewery.com/random"));

    const json = await res.json();

    return (
      <div>
        I can be rendered inline during SSR OR on the client!

        Here is something you can afterwards: {json.activity}
      </div>
    );
  }
}
