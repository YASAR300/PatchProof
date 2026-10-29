import { notFound } from "next/navigation";
import DevUiClient from "./DevUiClient";

export const metadata = {
  title: "PatchProof | UI Kitchen Sink (Dev Only)",
  description: "Interactive component test suite and design system tokens.",
};

export default function DevUiPage() {
  // Kitchen-sink page is only accessible in development environments
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DevUiClient />;
}
