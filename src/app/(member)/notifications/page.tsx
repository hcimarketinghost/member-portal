import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import EmptyState from "@/components/EmptyState";

export default function NotificationsPage() {
  return (
    <AppPage backHref="/account">
      <AppContent>
        <PageTitle title="Notifications" />
        <EmptyState body="You're all caught up. Class reminders, booking updates, and announcements will show up here." />
      </AppContent>
    </AppPage>
  );
}
