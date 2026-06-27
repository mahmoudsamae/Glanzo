type ForgeScrollCueProps = {
  href: string;
  className?: string;
};

export function ForgeScrollCue({ href, className }: ForgeScrollCueProps) {
  return (
    <a
      href={href}
      className={className ?? "ms-forge-scroll-cue"}
      aria-label="Weiter scrollen"
    >
      Scroll
      <span aria-hidden />
    </a>
  );
}
