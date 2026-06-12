import { configuredCronSecret, isValidCronSecret } from "@/lib/notifications/cron-auth";
import { dispatchNotificationBatch } from "@/server/modules/notifications/notifications.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const configured = configuredCronSecret();
  if (!configured) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const provided = request.headers.get("x-cron-secret");
  if (!isValidCronSecret(provided, configured)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await dispatchNotificationBatch();
  return Response.json(result);
}
