import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";

export default function HelpPage() {
  return (
    <AppPage backHref="/">
      <AppContent maxWidth={640}>
        <PageTitle title="Help" />
        <EmptyState
          body="For account, booking, or membership help, contact the HCI team."
          action={{ href: "mailto:membership@hillcountryindoor.com", label: "Contact HCI" }}
        />
      </AppContent>
    </AppPage>
  );
}
