import { type Layout } from "dashi";

const RootLayout: Layout = (_ctx, children) => {
  return (
    <html>
      <h1>Website Title</h1>
      {children}
    </html>
  );
};

export default RootLayout;
