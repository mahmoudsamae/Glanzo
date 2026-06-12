type CutLineProps = {
  /** 0–1 elapsed working-day fraction for Today header progress variant. */
  progress?: number;
};

export function CutLine({ progress }: CutLineProps) {
  const progressWidth =
    progress === undefined ? undefined : `${Math.min(1, Math.max(0, progress)) * 100}%`;

  return (
    <div className="cut-line" role="presentation" aria-hidden>
      <div
        className="cut-line__track"
        style={progressWidth ? { transform: "scaleX(1)", width: progressWidth } : undefined}
      />
      <div
        className="cut-line__notch"
        style={
          progressWidth
            ? { left: progressWidth, translate: "-50% -50%" }
            : undefined
        }
      />
    </div>
  );
}
