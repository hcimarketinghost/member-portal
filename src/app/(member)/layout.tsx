import { cookies } from "next/headers";
import BottomNav from "@/components/BottomNav";
import { MemberChromeProvider } from "@/components/MemberChrome";
import { getAccount } from "@/lib/clubready";

export default async function MemberAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);
  const account = userId ? await getAccount(userId) : null;
  const member = account
    ? {
        firstName: account.FirstName,
        lastName: account.LastName,
        fullName: `${account.FirstName} ${account.LastName}`,
        initials: `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`,
        email: account.Email,
        membershipTypeName: account.MembershipTypeName,
        membershipExpiresDate: account.MembershipExpiresDate,
        customStatusText: account.CustomStatusText,
        pastDueAmount: account.PastDueAmount,
      }
    : null;

  return (
    <MemberChromeProvider member={member}>
      {children}
      <BottomNav />
    </MemberChromeProvider>
  );
}
