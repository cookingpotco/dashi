import { type Ctx, group, status } from "dashi";
import { PostsLayout } from "./posts_layout.tsx";

export const posts = group("/posts", ({ route }) => ({
  layouts: [PostsLayout],
  routes: [
    route("/", { GET: index }),
    route("/:id", { GET: show }),
  ],
}));

function index() {
  return <h1>Posts</h1>;
}

function show(ctx: Ctx<{ id: string }>) {
  if (ctx.params.id === "missing") {
    return status(404, <p>No such post</p>);
  }
  return <p>{ctx.params.id}</p>;
}
