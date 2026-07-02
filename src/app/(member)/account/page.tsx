import AccountActions from "@/components/AccountActions";
import ActionMenu from "@/components/ActionMenu";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { getAccount } from "@/lib/clubready";

// TODO: replace with the real signed-in member's ClubReady UserId.
const CURRENT_USER_ID = 34822497;
const REFERRAL_URL = "https://www.hillcountryindoor.com/referral";

export default async function AccountPage() {
  const account = await getAccount(CURRENT_USER_ID);
  const initials = `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`;

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Profile" />

        <div className="hp-account-layout">
          <header className="hp-profile-row">
            <div className="hp-profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="hp-profile-id">
              <div className="hp-profile-name">
                {account.FirstName} {account.LastName}
              </div>
              <div className="hp-profile-username">{account.Email}</div>
            </div>
          </header>

          <div className="hp-account-group">
            <h2 className="hp-h2">Membership</h2>
            <section id="account-details" className="hp-card hp-account-stats" aria-label="Membership">
              <Row label="Membership" value="Individual" />
              <Row label="Status" value={account.CustomStatusText} />
              <Row label="Renews" value={account.MembershipExpiresDate} tabnum />
              {account.PastDueAmount > 0 && (
                <Row label="Past due" value={`$${account.PastDueAmount.toFixed(2)}`} tabnum />
              )}
            </section>
          </div>

          <div className="hp-account-group">
            <h2 className="hp-h2">Tools</h2>
            <ActionMenu
              ariaLabel="Member tools"
              items={[
                { href: "/notifications", label: "Notifications", icon: "bell" },
                { href: "/barcode", label: "Member card", icon: "card" },
                { href: "/reservations", label: "Your reservations", icon: "calendar" },
              ]}
            />
          </div>

          <div className="hp-account-group">
            <h2 className="hp-h2">Support</h2>
            <ActionMenu
              ariaLabel="Support"
              items={[
                { href: "/help", label: "Help", icon: "help" },
                { href: REFERRAL_URL, label: "Refer a friend", icon: "share", external: true },
              ]}
            />
          </div>

          <AccountActions />
        </div>
      </AppContent>
    </AppPage>
  );
}

function Row({
  label,
  value,
  tabnum,
}: {
  label: string;
  value: string;
  tabnum?: boolean;
}) {
  return (
    <div className="hp-row" style={{ justifyContent: "space-between" }}>
      <span className="hp-label">{label}</span>
      <span className={`hp-row-value ${tabnum ? "hp-tabnum" : ""}`} style={{ fontSize: 17 }}>
        {value}
      </span>
    </div>
  );
}
