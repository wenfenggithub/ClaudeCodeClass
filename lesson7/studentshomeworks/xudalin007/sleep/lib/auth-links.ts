export type AuthMode = "login" | "register" | "forgot" | "reset";

export function sanitizeNext(raw: string | null | undefined): string {
  if (!raw) return "/";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
}

export function authHref(mode: AuthMode = "login", next = "/"): string {
  const params = new URLSearchParams({ auth: mode });
  const safeNext = sanitizeNext(next);
  if (safeNext !== "/") params.set("next", safeNext);
  return `/?${params.toString()}`;
}
