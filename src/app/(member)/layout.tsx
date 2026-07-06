import { cookies } from "next/headers";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { getAccount } from "@/lib/clubready";

export default async function MemberAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = Number((await cookies()).get("hci_member_user_id")?.value);
  const account = userId ? await getAccount(userId) : null;
  const memberName = account?.FirstName ?? null;

  return (
    <>
      <TopBar memberName={memberName} />
      {children}
      <BottomNav memberName={memberName} />
    </>
  );
}
