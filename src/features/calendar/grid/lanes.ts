import type { PositionedBlock, TimeBlock } from "./types";

function overlaps(a: TimeBlock, b: TimeBlock): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}

/** Assign overlap lanes defensively (exclusion should prevent overlaps per barber). */
export function assignOverlapLanes(blocks: TimeBlock[]): PositionedBlock[] {
  const sorted = [...blocks].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
  const positioned: PositionedBlock[] = [];

  for (const block of sorted) {
    const usedLanes = new Set<number>();
    for (const other of positioned) {
      if (overlaps(block, other)) {
        usedLanes.add(other.lane);
      }
    }
    let lane = 0;
    while (usedLanes.has(lane)) {
      lane += 1;
    }
    positioned.push({ ...block, lane, laneCount: 1 });
  }

  for (const block of positioned) {
    const overlapping = positioned.filter(
      (other) => other.id !== block.id && overlaps(block, other),
    );
    const maxLane = Math.max(block.lane, ...overlapping.map((o) => o.lane), 0);
    const laneCount = maxLane + 1;
    for (const item of [block, ...overlapping]) {
      item.laneCount = Math.max(item.laneCount, laneCount);
    }
  }

  return positioned;
}

export function laneWidthPercent(lane: number, laneCount: number): {
  width: string;
  left: string;
} {
  const widthPct = 100 / laneCount;
  return {
    width: `${widthPct}%`,
    left: `${lane * widthPct}%`,
  };
}
