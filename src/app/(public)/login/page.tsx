import LoginForm from "@/components/LoginForm";
import Logo from "@/components/Logo";

export default function LoginPage() {
  return (
    <main className="hp-login">
      <div className="hp-login-card">
        <div className="hp-login-logo">
          <Logo height={46} />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
