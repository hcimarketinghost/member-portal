"use client";

import AccountActions from "@/components/AccountActions";
import { ActionList } from "@/components/ActionRow";

const REFERRAL_URL = "https://www.hillcountryindoor.com/referral";

export type MemberChromeAccount = {
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  membershipTypeName: string;
  membershipExpiresDate: string;
  customStatusText: string;
  pastDueAmount: number;
};

export default function AccountPanel({
  member,
  titleId,
}: {
  member: MemberChromeAccount;
  titleId?: string;
}) {
  return (
    <div className="hp-account-layout hp-account-drawer-layout">
      <header className="hp-profile-row">
        <div className="hp-profile-avatar" aria-hidden="true">
          {member.initials}
        </div>
        <div className="hp-profile-id">
          <div className="hp-profile-name" id={titleId}>
            {member.fullName}
          </div>
          <div className="hp-profile-username">{member.email}</div>
        </div>
      </header>

      <div className="hp-account-group">
        <h2 className="hp-h2">Membership</h2>
        <section className="hp-card hp-account-stats" aria-label="Membership">
          <AccountRow label="Membership" value={member.membershipTypeName || "Individual"} />
          <AccountRow label="Status" value={member.customStatusText} />
          <AccountRow label="Renews" value={member.membershipExpiresDate} tabnum />
          {member.pastDueAmount > 0 && (
            <AccountRow label="Past due" value={`$${member.pastDueAmount.toFixed(2)}`} tabnum />
          )}
        </section>
      </div>

      <div className="hp-account-group">
        <h2 className="hp-h2">Tools</h2>
        <ActionList
          ariaLabel="Member tools"
          items={[
            { href: "/notifications", title: "Notifications", icon: "bell" },
            { href: "/barcode", title: "Member card", icon: "card" },
            { href: "/reservations", title: "Your reservations", icon: "calendar" },
          ]}
        />
      </div>

      <div className="hp-account-group">
        <h2 className="hp-h2">Support</h2>
        <ActionList
          ariaLabel="Support"
          items={[
            { href: "/help", title: "Help", icon: "help" },
            { href: REFERRAL_URL, title: "Refer a friend", icon: "share", external: true },
          ]}
        />
      </div>

      <AccountActions />
    </div>
  );
}

function AccountRow({
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
