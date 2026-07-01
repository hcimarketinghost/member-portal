import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { getAccount } from "@/lib/clubready";

const CURRENT_USER_ID = 34822497;
const CODE39: Record<string, string> = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  $: "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn",
  "*": "nwnnwnwnn",
};

function code39Bars(value: string) {
  const encoded = `*${value.toUpperCase().replace(/[^0-9A-Z .$/+%-]/g, "")}*`;
  const bars: Array<{ x: number; width: number }> = [];
  const narrow = 2;
  const wide = 5;
  let x = 16;

  for (const char of encoded) {
    const pattern = CODE39[char] ?? CODE39["-"];
    [...pattern].forEach((unit, index) => {
      const width = unit === "w" ? wide : narrow;
      if (index % 2 === 0) bars.push({ x, width });
      x += width;
    });
    x += narrow;
  }

  return { bars, width: x + 16 };
}

function BarcodeSvg({ value }: { value: string }) {
  const { bars, width } = code39Bars(value);

  return (
    <svg className="hp-barcode-svg" viewBox={`0 0 ${width} 96`} role="img" aria-label={`Barcode ${value}`}>
      <rect width={width} height="96" fill="#fff" />
      {bars.map((bar, index) => (
        <rect key={`${bar.x}-${index}`} x={bar.x} y="16" width={bar.width} height="64" fill="#000" />
      ))}
    </svg>
  );
}

export default async function BarcodePage() {
  const account = await getAccount(CURRENT_USER_ID);
  const memberName = `${account.FirstName} ${account.LastName}`;
  const walletHref = `https://www.hillcountryindoor.com/digitalpass?email=${encodeURIComponent(account.Email)}`;

  return (
    <AppPage>
      <AppContent className="hp-card-shell">
        <PageTitle title="Member Card" />

        <section className="hp-member-card">
          <div className="hp-member-card-top">
            <div>
              <div className="hp-h2">{memberName}</div>
            </div>
          </div>

          <div className="hp-barcode-panel">
            <BarcodeSvg value={account.Barcode} />
            <div className="hp-barcode-number hp-tabnum">{account.Barcode}</div>
          </div>

          <a className="hp-btn" href={walletHref}>
            Add to Apple Wallet
          </a>
        </section>
      </AppContent>
    </AppPage>
  );
}
