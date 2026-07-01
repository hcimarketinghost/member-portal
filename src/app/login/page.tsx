import { AppContent, AppPage, PageTitle } from "@/components/AppPage";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AppPage backHref="/">
      <AppContent>
        <PageTitle title="Sign in" />
        <LoginForm />
      </AppContent>
    </AppPage>
  );
}
