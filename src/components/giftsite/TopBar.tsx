export default function TopBar() {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gift Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate and publish personalized gift pages.
        </p>
      </div>
    </header>
  );
}
