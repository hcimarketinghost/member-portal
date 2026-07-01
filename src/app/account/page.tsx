import AccountActions from "@/components/AccountActions";
import { AppContent, AppHeader, AppPage } from "@/components/AppPage";
import { getAccount } from "@/lib/clubready";

// TODO: replace with the real signed-in member's ClubReady UserId.
const CURRENT_USER_ID = 34822497;

export default async function AccountPage() {
  const account = await getAccount(CURRENT_USER_ID);
  const initials = `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`;

  return (
    <AppPage>
      <AppContent maxWidth={560}>
        <AppHeader className="hp-profile-header">
          <span className="hp-member-avatar" style={{ width: 80, height: 80, fontSize: 28, marginBottom: 16 }}>
            {initials}
          </span>
          <p className="hp-eyebrow">My account</p>
          <h1 className="hp-h2">
            {account.FirstName} {account.LastName}
          </h1>
        </AppHeader>

        <div id="account-details" className="hp-card">
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
