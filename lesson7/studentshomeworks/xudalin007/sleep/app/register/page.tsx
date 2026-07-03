import { redirect } from "next/navigation";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const params = new URLSearchParams({ auth: "register" });
  if (searchParams?.next) params.set("next", searchParams.next);
  redirect(`/?${params.toString()}`);
}
