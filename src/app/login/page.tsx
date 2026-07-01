import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AppPage backHref="/">
      <AppContent maxWidth={420}>
        <PageTitle eyebrow="Member sign in" title="Sign in" />
        <LoginForm />
      </AppContent>
    </AppPage>
  );
}
