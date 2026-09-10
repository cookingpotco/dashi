import { type ReadArgs } from "dashi";

export async function fetchActivity(): Promise<string> {
  const res = await fetch(new URL("https://bored-api.appbrewery.com/random"));
  const json = await res.json();
  return json.activity;
}

export function DeferredContent({ activity }: { activity: string }) {
  return (
    <div>
      I can be rendered inline during SSR OR on the client!

      Here is something you can afterwards: {activity}
    </div>
  );
}

export async function deferred({ html }: ReadArgs) {
  const activity = await fetchActivity();
  return html(<DeferredContent activity={activity} />);
}
