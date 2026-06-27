export type ServiceCatalogItem = {
  id: string;
  name: string;
  durationMin: number;
  priceCents: number;
  showPrice: boolean;
  description: string | null;
  imagePath: string | null;
  sortOrder: number;
  archivedAt: string | null;
  assignedMembershipIds: string[];
};

export type BarberOption = {
  membershipId: string;
  displayName: string;
  initials: string;
};
