import { cookies } from "next/headers";
import AccountPanel from "@/components/AccountPanel";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";
import { getAccount } from "@/lib/clubready";

export default async function AccountPage() {
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);
  const account = userId ? await getAccount(userId) : null;

  if (!account) {
    return (
      <AppPage>
        <AppContent>
          <PageTitle title="Profile" />
          <EmptyState
            body="We couldn't load your account details right now. Your membership is unaffected — try again in a minute."
            action={{ href: "/schedule", label: "Back to schedule" }}
          />
        </AppContent>
      </AppPage>
    );
  }

  const member = {
    firstName: account.FirstName,
    lastName: account.LastName,
    fullName: `${account.FirstName} ${account.LastName}`,
    initials: `${account.FirstName[0] ?? ""}${account.LastName[0] ?? ""}`,
    email: account.Email,
    membershipTypeName: account.MembershipTypeName,
    membershipExpiresDate: account.MembershipExpiresDate,
    customStatusText: account.CustomStatusText,
    pastDueAmount: account.PastDueAmount,
  };

  return (
    <AppPage>
      <AppContent>
        <PageTitle title="Profile" />

        <AccountPanel member={member} />
      </AppContent>
    </AppPage>
  );
}
