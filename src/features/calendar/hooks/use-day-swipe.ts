"use client";

import { type TouchEvent, useRef } from "react";

const SWIPE_THRESHOLD_PX = 56;

type UseDaySwipeOptions = {
  onNext: () => void;
  onPrev: () => void;
};

/** Horizontal swipe: finger right → next day, finger left → previous day. */
export function useDaySwipe({ onNext, onPrev }: UseDaySwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  function onTouchStart(event: TouchEvent) {
    if ((event.target as HTMLElement | null)?.closest("[data-day-picker]")) {
      startX.current = null;
      startY.current = null;
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  }

  function onTouchEnd(event: TouchEvent) {
    const originX = startX.current;
    const originY = startY.current;
    startX.current = null;
    startY.current = null;
    if (originX === null || originY === null) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - originX;
    const deltaY = touch.clientY - originY;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX > 0) {
      onNext();
    } else {
      onPrev();
    }
  }

  return { onTouchStart, onTouchEnd };
}
