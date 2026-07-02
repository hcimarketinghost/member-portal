import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function SignupButton({
  scheduleId,
  disabled,
}: {
  scheduleId: number;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <button className="hp-signup" disabled aria-label="Class is full">
        <UserPlusIcon aria-hidden="true" />
        Class Is Full
      </button>
    );
  }

  return (
    <Link className="hp-signup" href={`/book/confirm?scheduleId=${scheduleId}`} aria-label="Sign up for class">
      <UserPlusIcon aria-hidden="true" />
      Sign Up For Class
    </Link>
  );
}
