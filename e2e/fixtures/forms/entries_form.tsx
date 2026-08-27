function EntriesForm({ error }: { error?: string }) {
  return (
    <div>
      {error ? <p id="error">{error}</p> : null}
      <form id="validate-form" method="POST" action="/entries">
        <input type="hidden" name="intent" value="validate" />
        <input id="validate-title" name="title" />
        <button id="validate-submit" type="submit">Check</button>
      </form>
    </div>
  );
}

export { EntriesForm };
