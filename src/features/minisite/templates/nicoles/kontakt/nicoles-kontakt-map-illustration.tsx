type NicolesKontaktMapIllustrationProps = {
  shopName?: string;
};

export function NicolesKontaktMapIllustration({ shopName = "Nicoles" }: NicolesKontaktMapIllustrationProps) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden className="size-full">
      <circle cx="200" cy="200" r="198" fill="#f5f0eb" stroke="currentColor" strokeWidth="3" />
      <path
        d="M40 120h320M40 200h320M40 280h320M120 40v320M200 40v320M280 40v320"
        stroke="#ddd5cb"
        strokeWidth="1.5"
      />
      <path
        d="M60 340 C120 300, 160 260, 200 220 C240 180, 280 140, 340 80"
        stroke="#5c5c5c"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M80 60 C140 100, 180 140, 220 180 C260 220, 300 260, 340 320"
        stroke="#5c5c5c"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.28"
      />
      <text x="72" y="92" fill="#5c5c5c" fontSize="14" fontWeight="600" letterSpacing="0.08em">
        A3
      </text>
      <text x="300" y="318" fill="#5c5c5c" fontSize="14" fontWeight="600" letterSpacing="0.08em">
        A93
      </text>
      <ellipse cx="200" cy="205" rx="58" ry="42" fill="#ebe4db" />
      <text x="200" y="210" fill="#1a1a1a" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.12em">
        INNENSTADT
      </text>
      <path
        d="M200 118 L214 152 H186 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="200" cy="152" r="10" fill="currentColor" />
      <text x="200" y="182" fill="#1a1a1a" fontSize="12" fontWeight="600" textAnchor="middle">
        {shopName}
      </text>
      <path
        d="M130 250 Q170 230 200 245 T270 250"
        stroke="#b8923a"
        strokeWidth="2"
        strokeDasharray="4 6"
        opacity="0.8"
      />
    </svg>
  );
}
