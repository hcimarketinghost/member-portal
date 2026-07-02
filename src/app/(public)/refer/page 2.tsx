import TopBar from "@/components/TopBar";

export default function ReferPage() {
  return (
    <div className="hp-detail">
      <TopBar backHref="/" />
      <div className="hp-shell hp-screen hp-rise" style={{ maxWidth: 640 }}>
        <header style={{ padding: "16px 0 32px", textAlign: "center" }}>
          <h1 className="hp-h2">Refer A Friend</h1>
        </header>
        <div className="hp-card" style={{ textAlign: "center" }}>
          <p className="hp-body">Share HCI with a friend and the membership team will help with the referral.</p>
          <a href="mailto:membership@hillcountryindoor.com" className="hp-btn hp-btn-inset" style={{ marginTop: 20 }}>
            Email membership
          </a>
        </div>
      </div>
    </div>
  );
}
