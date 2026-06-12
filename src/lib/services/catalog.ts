export type ServiceCatalogItem = {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
  sortOrder: number;
  archivedAt: string | null;
  assignedMembershipIds: string[];
};

export type BarberOption = {
  membershipId: string;
  displayName: string;
  initials: string;
};
