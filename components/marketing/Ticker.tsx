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
  // Duplicate items for seamless infinite scroll
  const list = [...ITEMS, ...ITEMS];
  return (
    <div
      id="after-hero"
      className="group overflow-hidden border-y border-border-dark bg-bg-dark py-6"
    >
      <div className="flex w-max items-center gap-10 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
        {list.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            {item}
            <span className="text-orange">■</span>
          </span>
        ))}
      </div>
    </div>
  );
}
