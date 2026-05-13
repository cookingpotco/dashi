const InternalComponent = () => {
  return <h2>I am internal...</h2>;
};

export const TestComponent = (
  { urlParams = {} }: { urlParams?: Record<string, string> },
) => {
  return (
    <div>
      <h1>Hello World!</h1>
      <ul>
        {Object.values(urlParams).map((p) => <li>Param value {p}</li>)}
      </ul>
      <InternalComponent />
    </div>
  );
};
