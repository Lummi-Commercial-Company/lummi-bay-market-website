import Scaffold from "@/components/Scaffold";

export const metadata = { title: "About us" };

export default function Page() {
  return (
    <Scaffold
      title="About us"
      note="The brand story grounded in Lummi values, with a light community note. Corporate and enterprise content stays out — see ADR 0001."
    />
  );
}
