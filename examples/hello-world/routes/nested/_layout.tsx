import { type Layout } from "dashi";

const NestedLayout: Layout = (_ctx, children) => {
  return (
    <div>
      <h2>Nested</h2>
      {children}
    </div>
  );
};

export default NestedLayout;
