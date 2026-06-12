import { clientEnv } from "@/lib/env";

/** Absolute invite URL for owner/staff join links. */
export function buildInviteAbsoluteUrl(invitePath: string): string {
  const rootDomain = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const protocol = rootDomain.includes("localhost") ? "http" : "https";
  const path = invitePath.startsWith("/") ? invitePath : `/${invitePath}`;
  return `${protocol}://${rootDomain}${path}`;
}
