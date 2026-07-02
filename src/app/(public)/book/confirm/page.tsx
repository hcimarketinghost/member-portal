import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InfoPage from "@/components/InfoPage";

type SearchValue = string | string[] | undefined;

function one(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function appendParams(path: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * Handoff route. Signed-in members are sent to the class detail page with the
 * booking drawer open (`?book=1`); everyone else goes through /book to log in.
 * Only renders when the handoff arrives without a schedule ID.
 */
export default async function BookConfirmPage(props: PageProps<"/book/confirm">) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    const next = one(value);
    if (next) params.set(key, next);
  });

  const userId = Number((await cookies()).get("hci_member_user_id")?.value);

  if (!userId) {
    redirect(appendParams("/book", params));
  }

  const scheduleId = Number(one(searchParams.scheduleId));

  if (scheduleId) {
    redirect(`/classes/${scheduleId}?book=1`);
  }

  const title = one(searchParams.className) || "Selected class";
  const heroStyle = {
    backgroundImage:
      "radial-gradient(120% 80% at 70% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(160deg, #262626 0%, #101010 100%)",
  };

  return (
    <InfoPage title={title} eyebrow="Confirm booking" backHref="/schedule" hero={heroStyle}>
      <div className="hp-book-detail">
        <section className="hp-book-confirm-panel" aria-label="Booking confirmation">
          <p className="hp-book-message is-error">
            This handoff is missing a schedule ID, so booking is paused until the live API feed includes one.
          </p>
          <div className="hp-book-secondary">
            <Link href="/schedule">View schedule</Link>
            <Link href="/reservations">Your reservations</Link>
          </div>
        </section>
      </div>
    </InfoPage>
  );
}
