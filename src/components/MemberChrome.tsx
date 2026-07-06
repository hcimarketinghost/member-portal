"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";
import AccountPanel, { type MemberChromeAccount } from "@/components/AccountPanel";
import Sheet from "@/components/Sheet";

type MemberChromeContextValue = {
  member: MemberChromeAccount | null;
  openAccount: () => void;
};

const MemberChromeContext = createContext<MemberChromeContextValue | null>(null);

export function MemberChromeProvider({
  member,
  children,
}: {
  member: MemberChromeAccount | null;
  children: React.ReactNode;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const value = useMemo(
    () => ({
      member,
      openAccount: () => setAccountOpen(true),
    }),
    [member],
  );

  return (
    <MemberChromeContext.Provider value={value}>
      {children}
      {member && (
        <Sheet
          open={accountOpen}
          onClose={() => setAccountOpen(false)}
          labelledBy="account-drawer-title"
        >
          <AccountPanel member={member} titleId="account-drawer-title" />
        </Sheet>
      )}
    </MemberChromeContext.Provider>
  );
}

export function useMemberChrome() {
  return useContext(MemberChromeContext);
}

export function HeaderProfileButton() {
  const chrome = useMemberChrome();

  if (!chrome) return null;

  if (!chrome.member) {
    return (
      <Link className="hp-header-avatar" href="/login" aria-label="Log in">
        <span aria-hidden="true">?</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="hp-header-avatar"
      aria-label="Open account"
      onClick={chrome.openAccount}
    >
      <span aria-hidden="true">{chrome.member.initials}</span>
    </button>
  );
}
