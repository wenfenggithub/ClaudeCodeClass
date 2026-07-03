import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const params = new URLSearchParams({ auth: "login" });
  if (searchParams?.next) params.set("next", searchParams.next);
  redirect(`/?${params.toString()}`);
}
