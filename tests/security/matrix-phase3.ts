import { SEED } from "./constants";
import { denyMessage, type MatrixAssertion } from "./matrix-shared";

export const PHASE3_TABLE_REGISTRY = [
  "customers",
  "appointments",
  "notification_outbox",
] as const;

export type Phase3Table = (typeof PHASE3_TABLE_REGISTRY)[number];

export const PHASE3_MATRIX_ASSERTIONS: MatrixAssertion[] = [
  // --- customers cross-tenant ---
  {
    id: "ownerA SELECT customers[A]",
    actor: "ownerA",
    table: "customers",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("customers")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerA SELECT customers[A]", "no error", error.message));
      if ((data?.length ?? 0) < 1) {
        throw new Error(
          denyMessage("ownerA SELECT customers[A]", "ROWS >=1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerB SELECT customers[A]",
    actor: "ownerB",
    table: "customers",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("customers")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerB SELECT customers[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT customers[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB INSERT customers[A]",
    actor: "ownerB",
    table: "customers",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerB.from("customers").insert({
        shop_id: SEED.shops.a.id,
        name: "Hacked Customer",
        phone: "+4915111111111",
      });
      if (!error) throw new Error(denyMessage("ownerB INSERT customers[A]", "DENY", "ALLOW"));
    },
  },
  {
    id: "barberA INSERT customers[A]",
    actor: "barberA",
    table: "customers",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.barberA.from("customers").insert({
        shop_id: SEED.shops.a.id,
        name: "Barber Customer",
        phone: "+4915222222222",
      });
      if (!error) throw new Error(denyMessage("barberA INSERT customers[A]", "DENY", "ALLOW"));
    },
  },
  // --- appointments barber scoping ---
  {
    id: "barberA UPDATE appointments[self]",
    actor: "barberA",
    table: "appointments",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", SEED.phase3.appointmentBarberA)
        .select("id");
      if (error) throw new Error(denyMessage("barberA UPDATE appointments[self]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("barberA UPDATE appointments[self]", "ALLOW 1 row", `ROWS ${data?.length ?? 0}`),
        );
      }
      await clients.ownerA
        .from("appointments")
        .update({ status: "booked" })
        .eq("id", SEED.phase3.appointmentBarberA);
    },
  },
  {
    id: "barberA UPDATE appointments[owner row]",
    actor: "barberA",
    table: "appointments",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", SEED.phase3.appointmentOwnerA)
        .select("id");
      if (error) throw new Error(denyMessage("barberA UPDATE appointments[owner]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(
          denyMessage("barberA UPDATE appointments[owner]", "DENY 0 rows", `ALLOW ${data?.length}`),
        );
      }
    },
  },
  {
    id: "ownerB SELECT appointments[A]",
    actor: "ownerB",
    table: "appointments",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("appointments")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerB SELECT appointments[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT appointments[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB UPDATE appointments[A]",
    actor: "ownerB",
    table: "appointments",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("shop_id", SEED.shops.a.id)
        .select("id");
      if (error) throw new Error(denyMessage("ownerB UPDATE appointments[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB UPDATE appointments[A]", "DENY", "ALLOW"));
      }
    },
  },
  // --- notification_outbox ---
  {
    id: "ownerA SELECT notification_outbox[A]",
    actor: "ownerA",
    table: "notification_outbox",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("notification_outbox")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) {
        throw new Error(denyMessage("ownerA SELECT notification_outbox[A]", "no error", error.message));
      }
      if ((data?.length ?? 0) < 1) {
        throw new Error(
          denyMessage("ownerA SELECT notification_outbox[A]", "ROWS >=1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "barberA SELECT notification_outbox[all]",
    actor: "barberA",
    table: "notification_outbox",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA.from("notification_outbox").select("id");
      if (error) {
        throw new Error(denyMessage("barberA SELECT notification_outbox", "no error", error.message));
      }
      if ((data?.length ?? 0) !== 0) {
        throw new Error(
          denyMessage("barberA SELECT notification_outbox", "ROWS 0", `ROWS ${data?.length}`),
        );
      }
    },
  },
  {
    id: "ownerA INSERT notification_outbox[A]",
    actor: "ownerA",
    table: "notification_outbox",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerA.from("notification_outbox").insert({
        shop_id: SEED.shops.a.id,
        appointment_id: SEED.phase3.appointmentBarberA,
        channel: "email",
        template: "booking_confirmed",
        payload: {},
        scheduled_for: new Date().toISOString(),
      });
      if (!error) {
        throw new Error(denyMessage("ownerA INSERT notification_outbox[A]", "DENY", "ALLOW"));
      }
    },
  },
  // --- anon zero rows on Phase 3 tenant tables ---
  ...PHASE3_TABLE_REGISTRY.map(
    (table): MatrixAssertion => ({
      id: `anon SELECT ${table}[all]`,
      actor: "anon",
      table,
      operation: "SELECT",
      run: async ({ clients }) => {
        const { data, error } = await clients.anon.from(table).select("*").limit(1);
        if (error) throw new Error(denyMessage(`anon SELECT ${table}`, "no error", error.message));
        if ((data?.length ?? 0) !== 0) {
          throw new Error(denyMessage(`anon SELECT ${table}`, "ROWS 0", `ROWS ${data?.length}`));
        }
      },
    }),
  ),
];
