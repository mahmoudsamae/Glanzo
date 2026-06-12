/** Seed identities — mirror of supabase/seed.sql stable IDs. */
export const SEED = {
  users: {
    ownerA: {
      id: "a0000000-0000-4000-8000-000000000001",
      email: "owner-a@glanzo.test",
      password: "password123",
    },
    ownerB: {
      id: "a0000000-0000-4000-8000-000000000002",
      email: "owner-b@glanzo.test",
      password: "password123",
    },
    barberA: {
      id: "a0000000-0000-4000-8000-000000000003",
      email: "barber-a@glanzo.test",
      password: "password123",
    },
    platformAdmin: {
      id: "a0000000-0000-4000-8000-000000000004",
      email: "platform-admin@glanzo.test",
      password: "password123",
    },
  },
  shops: {
    a: {
      id: "b0000000-0000-4000-8000-000000000001",
      slug: "demo-barber-a",
    },
    b: {
      id: "b0000000-0000-4000-8000-000000000002",
      slug: "demo-barber-b",
    },
  },
  memberships: {
    ownerA: "d0000000-0000-4000-8000-000000000001",
    ownerB: "d0000000-0000-4000-8000-000000000002",
    barberA: "d0000000-0000-4000-8000-000000000003",
  },
  phase2: {
    serviceA: "f0000000-0000-4000-8000-000000000001",
    staffHoursBarberA: "f0000000-0000-4000-8000-000000000010",
    staffHoursOwnerA: "f0000000-0000-4000-8000-000000000011",
    timeOffBarberA: "f0000000-0000-4000-8000-000000000020",
    inviteShopA: {
      id: "f0000000-0000-4000-8000-000000000030",
      token: "seed-invite-token-shop-a-32chars-min",
    },
    inviteShopB: {
      id: "f0000000-0000-4000-8000-000000000031",
      token: "seed-invite-token-shop-b-32chars-min",
    },
  },
  phase3: {
    customerA: "a0000003-0000-4000-8000-000000000001",
    customerPhone: "+491701234567",
    appointmentBarberA: "a0000003-0000-4000-8000-000000000010",
    appointmentOwnerA: "a0000003-0000-4000-8000-000000000011",
    manageTokenBarberA: "seed-manage-token-barber-a-32chars-min",
    outboxConfirmed: "a0000003-0000-4000-8000-000000000020",
  },
} as const;

export {
  LOCAL_SUPABASE_ANON_KEY,
  LOCAL_SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "../lib/supabase-target";
