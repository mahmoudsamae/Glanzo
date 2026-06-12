export type TimeBlock = {
  id: string;
  startMs: number;
  endMs: number;
};

export type PositionedBlock = TimeBlock & {
  lane: number;
  laneCount: number;
};

export type GridWindow = {
  startMs: number;
  endMs: number;
};

export type ColumnLayout = {
  columnWidthPx: number;
  columnCount: number;
  gutterPx: number;
};
