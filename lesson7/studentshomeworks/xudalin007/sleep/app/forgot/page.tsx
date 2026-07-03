import { redirect } from "next/navigation";

export default function ForgotPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const params = new URLSearchParams({ auth: "forgot" });
  if (searchParams?.next) params.set("next", searchParams.next);
  redirect(`/?${params.toString()}`);
}
