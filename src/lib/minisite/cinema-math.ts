/** Hero pointer-tilt — clamp to max degrees (CSS 3D, no WebGL). */
export function clampHeroTilt(
  normalizedX: number,
  normalizedY: number,
  maxDeg: number,
): { rotateX: number; rotateY: number } {
  const rotateY = Math.max(-maxDeg, Math.min(maxDeg, normalizedX * maxDeg * 2));
  const rotateX = Math.max(-maxDeg, Math.min(maxDeg, -normalizedY * maxDeg * 2));
  return { rotateX, rotateY };
}

/** Whether decorative cinema motion should run (not reduced-motion). */
export function shouldApplyCinemaMotion(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}
