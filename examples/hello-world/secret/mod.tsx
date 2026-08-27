import { group } from "dashi";

export const secret = group("/secret", ({ route }) => ({
  routes: [route("/", { GET: Secret })],
}));

function Secret() {
  return (
    <html>
      <h2>{"<3"}</h2>
    </html>
  );
}
