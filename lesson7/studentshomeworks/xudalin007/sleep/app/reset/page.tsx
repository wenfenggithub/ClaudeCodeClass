import { redirect } from "next/navigation";

export default function ResetPage({
  searchParams,
}: {
  searchParams?: { token?: string; next?: string };
}) {
  const params = new URLSearchParams({ auth: "reset" });
  if (searchParams?.token) params.set("token", searchParams.token);
  if (searchParams?.next) params.set("next", searchParams.next);
  redirect(`/?${params.toString()}`);
}
