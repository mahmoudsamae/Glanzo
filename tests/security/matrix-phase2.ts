import { SEED } from "./constants";
import { denyMessage, type MatrixAssertion } from "./matrix-shared";

export const PHASE2_TABLE_REGISTRY = [
  "services",
  "service_staff",
  "staff_hours",
  "time_off",
  "staff_invites",
] as const;

export type Phase2Table = (typeof PHASE2_TABLE_REGISTRY)[number];

export const PHASE2_MATRIX_ASSERTIONS: MatrixAssertion[] = [
  // --- services cross-tenant ---
  {
    id: "ownerA SELECT services[A]",
    actor: "ownerA",
    table: "services",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("services")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerA SELECT services[A]", "no error", error.message));
      if ((data?.length ?? 0) < 1) {
        throw new Error(denyMessage("ownerA SELECT services[A]", "ROWS >=1", `ROWS ${data?.length ?? 0}`));
      }
    },
  },
  {
    id: "ownerA SELECT services[B]",
    actor: "ownerA",
    table: "services",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("services")
        .select("id")
        .eq("shop_id", SEED.shops.b.id);
      if (error) throw new Error(denyMessage("ownerA SELECT services[B]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerA SELECT services[B]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB INSERT services[A]",
    actor: "ownerB",
    table: "services",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerB.from("services").insert({
        shop_id: SEED.shops.a.id,
        name: "Hacked Service",
        duration_min: 30,
        price_cents: 1000,
      });
      if (!error) throw new Error(denyMessage("ownerB INSERT services[A]", "DENY", "ALLOW"));
    },
  },
  {
    id: "barberA INSERT services[A]",
    actor: "barberA",
    table: "services",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.barberA.from("services").insert({
        shop_id: SEED.shops.a.id,
        name: "Barber Service",
        duration_min: 30,
        price_cents: 1000,
      });
      if (!error) throw new Error(denyMessage("barberA INSERT services[A]", "DENY", "ALLOW"));
    },
  },
  // --- staff_hours central barber scoping ---
  {
    id: "barberA UPDATE staff_hours[self]",
    actor: "barberA",
    table: "staff_hours",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("staff_hours")
        .update({ end_time: "18:00" })
        .eq("id", SEED.phase2.staffHoursBarberA)
        .select("id");
      if (error) throw new Error(denyMessage("barberA UPDATE staff_hours[self]", "no error", error.message));
      if (data?.length !== 1) {
        throw new Error(
          denyMessage("barberA UPDATE staff_hours[self]", "ALLOW 1 row", `ROWS ${data?.length ?? 0}`),
        );
      }
      await clients.ownerA
        .from("staff_hours")
        .update({ end_time: "17:00" })
        .eq("id", SEED.phase2.staffHoursBarberA);
    },
  },
  {
    id: "barberA UPDATE staff_hours[owner row]",
    actor: "barberA",
    table: "staff_hours",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("staff_hours")
        .update({ end_time: "18:00" })
        .eq("id", SEED.phase2.staffHoursOwnerA)
        .select("id");
      if (error) throw new Error(denyMessage("barberA UPDATE staff_hours[owner]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("barberA UPDATE staff_hours[owner]", "DENY 0 rows", `ALLOW ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB SELECT staff_hours[A]",
    actor: "ownerB",
    table: "staff_hours",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("staff_hours")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerB SELECT staff_hours[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT staff_hours[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB UPDATE staff_hours[A]",
    actor: "ownerB",
    table: "staff_hours",
    operation: "UPDATE",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("staff_hours")
        .update({ end_time: "18:00" })
        .eq("shop_id", SEED.shops.a.id)
        .select("id");
      if (error) throw new Error(denyMessage("ownerB UPDATE staff_hours[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB UPDATE staff_hours[A]", "DENY", "ALLOW"));
      }
    },
  },
  // --- time_off cross-tenant ---
  {
    id: "ownerB SELECT time_off[A]",
    actor: "ownerB",
    table: "time_off",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("time_off")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerB SELECT time_off[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT time_off[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "ownerB INSERT time_off[A]",
    actor: "ownerB",
    table: "time_off",
    operation: "INSERT",
    run: async ({ clients }) => {
      const { error } = await clients.ownerB.from("time_off").insert({
        shop_id: SEED.shops.a.id,
        membership_id: SEED.memberships.barberA,
        starts_at: "2026-09-01T00:00:00Z",
        ends_at: "2026-09-02T00:00:00Z",
      });
      if (!error) throw new Error(denyMessage("ownerB INSERT time_off[A]", "DENY", "ALLOW"));
    },
  },
  // --- staff_invites ---
  {
    id: "ownerA SELECT staff_invites[A]",
    actor: "ownerA",
    table: "staff_invites",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("staff_invites")
        .select("id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerA SELECT staff_invites[A]", "no error", error.message));
      if ((data?.length ?? 0) < 1) {
        throw new Error(
          denyMessage("ownerA SELECT staff_invites[A]", "ROWS >=1", `ROWS ${data?.length ?? 0}`),
        );
      }
    },
  },
  {
    id: "ownerA SELECT staff_invites[B token]",
    actor: "ownerA",
    table: "staff_invites",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerA
        .from("staff_invites")
        .select("id")
        .eq("token", SEED.phase2.inviteShopB.token);
      if (error) throw new Error(denyMessage("ownerA SELECT staff_invites[B token]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(
          denyMessage("ownerA SELECT staff_invites[B token]", "ROWS 0", `ROWS ${data?.length}`),
        );
      }
    },
  },
  {
    id: "barberA SELECT staff_invites[all]",
    actor: "barberA",
    table: "staff_invites",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA.from("staff_invites").select("id");
      if (error) throw new Error(denyMessage("barberA SELECT staff_invites", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("barberA SELECT staff_invites", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  {
    id: "barberA SELECT staff_invites[token]",
    actor: "barberA",
    table: "staff_invites",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.barberA
        .from("staff_invites")
        .select("id")
        .eq("token", SEED.phase2.inviteShopA.token);
      if (error) throw new Error(denyMessage("barberA SELECT staff_invites[token]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(
          denyMessage("barberA SELECT staff_invites[token]", "ROWS 0", `ROWS ${data?.length}`),
        );
      }
    },
  },
  // --- service_staff ---
  {
    id: "ownerB SELECT service_staff[A]",
    actor: "ownerB",
    table: "service_staff",
    operation: "SELECT",
    run: async ({ clients }) => {
      const { data, error } = await clients.ownerB
        .from("service_staff")
        .select("service_id")
        .eq("shop_id", SEED.shops.a.id);
      if (error) throw new Error(denyMessage("ownerB SELECT service_staff[A]", "no error", error.message));
      if ((data?.length ?? 0) !== 0) {
        throw new Error(denyMessage("ownerB SELECT service_staff[A]", "ROWS 0", `ROWS ${data?.length}`));
      }
    },
  },
  // --- anon zero rows on all Phase 2 tables ---
  ...PHASE2_TABLE_REGISTRY.map(
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
