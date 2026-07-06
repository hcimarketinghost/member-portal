import AccountPanel from "@/components/AccountPanel";
import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import { getAccount } from "@/lib/clubready";

// TODO: replace with the real signed-in member's ClubReady UserId.
const CURRENT_USER_ID = 34822497;

export default async function AccountPage() {
  const account = await getAccount(CURRENT_USER_ID);
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
