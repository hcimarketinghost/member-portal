import type { Metadata, Viewport } from "next";
import WelcomeFlow from "./WelcomeFlow";

export const metadata: Metadata = {
  title: "Welcome to HCI",
  description: "Get your pass and set up your membership.",
  robots: { index: false, follow: false },
};

// themeColor belongs on the viewport export, not metadata.
export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function WelcomePage() {
  return <WelcomeFlow />;
}
