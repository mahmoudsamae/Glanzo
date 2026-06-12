import type { ShopPublicData } from "@/lib/validations/public-shop";

/** Apply owner-defined team_order; unknown ids append in original order. */
export function orderTeamMembers(data: ShopPublicData): ShopPublicData["team"] {
  const { team, minisite } = data;
  const order = minisite.content.team_order;
  if (!order?.length) {
    return team;
  }

  const byId = new Map(team.map((member) => [member.membership_id, member]));
  const ordered: ShopPublicData["team"] = [];

  for (const id of order) {
    const member = byId.get(id);
    if (member) {
      ordered.push(member);
      byId.delete(id);
    }
  }

  for (const member of team) {
    if (byId.has(member.membership_id)) {
      ordered.push(member);
    }
  }

  return ordered;
}
