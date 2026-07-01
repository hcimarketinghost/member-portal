import AccountActions from "@/components/AccountActions";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { getAccount } from "@/lib/clubready";

// TODO: replace with the real signed-in member's ClubReady UserId.
const CURRENT_USER_ID = 34822497;

export default async function AccountPage() {
  const account = await getAccount(CURRENT_USER_ID);
  const initials = `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`;

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="My account" />

        <section className="hp-card hp-account-profile">
          <div className="hp-member-card-top">
            <div className="hp-detail-instructor">
              <span className="hp-member-avatar">{initials}</span>
              <div>
                <div className="hp-h2">
                  {account.FirstName} {account.LastName}
                </div>
                <div className="hp-label">{account.Email}</div>
              </div>
            </div>
          </div>
        </section>

        <div id="account-details" className="hp-card hp-account-stats">
          <Row label="Membership" value={account.MembershipTypeName} first />
          <Row label="Status" value={account.CustomStatusText} />
          <Row label="Renews" value={account.MembershipExpiresDate} tabnum />
          <Row label="Classes attended" value={String(account.ClassAttendanceCount)} tabnum />
          {account.PastDueAmount > 0 && (
            <Row label="Past due" value={`$${account.PastDueAmount.toFixed(2)}`} tabnum />
          )}
        </div>

        <AccountActions />
      </AppContent>
    </AppPage>
  );
}

function Row({
  label,
  value,
  first,
  tabnum,
}: {
  label: string;
  value: string;
  first?: boolean;
  tabnum?: boolean;
}) {
  return (
    <div className="hp-row" style={{ justifyContent: "space-between", paddingTop: first ? 0 : undefined }}>
      <span className="hp-label">{label}</span>
      <span className={`hp-row-value ${tabnum ? "hp-tabnum" : ""}`} style={{ fontSize: 17 }}>
        {value}
      </span>
    </div>
  );
}
