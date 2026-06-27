"use client";

import { useCallback, useRef, useState } from "react";

type MeccaBeforeAfterProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export function MeccaBeforeAfter({
  beforeSrc,
  afterSrc,
  beforeLabel = "Vorher",
  afterLabel = "Nachher",
}: MeccaBeforeAfterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  const updateSplit = useCallback((clientX: number) => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.max(8, Math.min(92, next)));
  }, []);

  return (
    <div
      ref={rootRef}
      className="ms-mecca-before-after ms-mecca-reveal ms-mecca-reveal--fade"
      style={{ ["--ms-mecca-split" as string]: `${split}%` }}
      onPointerDown={(event) => {
        dragging.current = true;
        rootRef.current?.setPointerCapture(event.pointerId);
        updateSplit(event.clientX);
      }}
      onPointerMove={(event) => {
        if (!dragging.current) return;
        updateSplit(event.clientX);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        rootRef.current?.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      role="group"
      aria-label="Vorher und Nachher Vergleich"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterSrc} alt="" className="ms-mecca-before-after__after" draggable={false} />
      <div className="ms-mecca-before-after__before-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt="" className="ms-mecca-before-after__before" draggable={false} />
      </div>
      <span className="absolute left-4 top-4 z-[4] rounded-full bg-[rgb(8_6_4/0.72)] px-3 py-1 text-[0.6875rem] uppercase tracking-[0.12em] text-[color:var(--ms-mecca-cream)]">
        {beforeLabel}
      </span>
      <span className="absolute right-4 top-4 z-[4] rounded-full bg-[rgb(8_6_4/0.72)] px-3 py-1 text-[0.6875rem] uppercase tracking-[0.12em] text-[color:var(--ms-mecca-cream)]">
        {afterLabel}
      </span>
      <div className="ms-mecca-before-after__divider" aria-hidden />
      <div className="ms-mecca-before-after__handle" aria-hidden>
        ↔
      </div>
    </div>
  );
}
