import Scaffold from "@/components/Scaffold";

export const metadata = { title: "Contact us" };

export default function Page() {
  return (
    <Scaffold
      title="Contact us"
      note="The contact form. Needs a form handler wired up before it can accept a submission."
    />
  );
}
