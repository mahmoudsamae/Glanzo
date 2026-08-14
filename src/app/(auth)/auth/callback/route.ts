import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getActorState,
  resolvePostAuthRedirect,
} from "@/server/modules/auth/get-actor-state";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
    }
  }

  const nextParam = requestUrl.searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  const state = await getActorState();
  if (state.kind === "unauthenticated") {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const destination = next ?? resolvePostAuthRedirect(state.actor);
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
