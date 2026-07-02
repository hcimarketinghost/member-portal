import BottomNav from "@/components/BottomNav";

export default function MemberAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
