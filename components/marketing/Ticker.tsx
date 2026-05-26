const ITEMS = [
  "ID Cards",
  "RFID Cards",
  "Smart Cards",
  "NFC Cards",
  "Access Cards",
  "Employee Cards",
  "Student IDs",
  "Membership Cards",
  "Visitor Cards",
  "Government IDs",
];

export function Ticker() {
  const list = [...ITEMS, ...ITEMS];
  return (
    <div
      id="after-hero"
      className="group overflow-hidden border-y border-border bg-bg-page py-5"
    >
      <div className="flex w-max items-center gap-12 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
        {list.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-12 text-xs font-medium uppercase tracking-[0.22em] text-text-muted"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-text-hint" />
          </span>
        ))}
      </div>
    </div>
  );
}
