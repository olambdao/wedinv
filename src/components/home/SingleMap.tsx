import styled from "styled-components";

const M = {
  paper: "#FBF8F1",
  road: "#C9B79A",
  hwy: "#D8D2C5",
  accent: "#5F6654",
  ink: "#2A2620",
  inkSoft: "#5A554E",
  inkMuted: "#8C8578",
  rule: "rgba(42,38,32,0.12)",
} as const;

const FS = `"Noto Serif KR", serif`;
const FX = `-apple-system, "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif`;
const FM = `"JetBrains Mono", ui-monospace, Menlo, monospace`;

const MapSvg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid ${M.rule};
  background: ${M.paper};
`;

type LandmarkProps = {
  x: number;
  y: number;
  label: string;
  side?: "left" | "right";
  muted?: boolean;
};

const Landmark = ({ x, y, label, side = "left", muted }: LandmarkProps) => {
  const dx = side === "left" ? -8 : 8;
  const anchor = side === "left" ? "end" : "start";

  return (
    <g>
      <circle cx={x} cy={y} r="2.6" fill={M.inkSoft} />
      <text
        x={x + dx}
        y={y + 4}
        fontSize="9.5"
        fontFamily={FX}
        fill={muted ? M.inkMuted : M.inkSoft}
        textAnchor={anchor}
      >
        {label}
      </text>
    </g>
  );
};

const ICMarker = ({
  x,
  y,
  label,
  sub,
}: {
  x: number;
  y: number;
  label: string;
  sub: string;
}) => (
  <g>
    <circle cx={x} cy={y} r="13" fill={M.paper} stroke={M.inkSoft} strokeWidth="1.2" />
    <text
      x={x}
      y={y + 3.5}
      fontSize="9.5"
      fontFamily={FM}
      textAnchor="middle"
      fill={M.inkSoft}
      letterSpacing="0.04em"
    >
      IC
    </text>
    <text
      x={x}
      y={y + 26}
      fontSize="12"
      fontFamily={FS}
      textAnchor="middle"
      fill={M.ink}
      fontWeight="500"
      letterSpacing="0.04em"
    >
      {label}
    </text>
    <text x={x} y={y + 40} fontSize="9" fontFamily={FX} textAnchor="middle" fill={M.inkMuted}>
      {sub}
    </text>
  </g>
);

const VenuePin = ({ x, y }: { x: number; y: number }) => (
  <g>
    <g transform={`translate(${x - 12}, ${y - 32})`}>
      <path
        d="M12 0C5.4 0 0 5.4 0 12c0 8 12 22 12 22s12-14 12-22C24 5.4 18.6 0 12 0z"
        fill={M.accent}
      />
      <circle cx="12" cy="12" r="4.2" fill={M.paper} />
    </g>
    <g transform={`translate(${x + 18}, ${y - 32})`}>
      <text x="0" y="10" fontSize="13" fontFamily={FS} fill={M.ink} fontWeight="500" letterSpacing="0.06em">
        시재 바이 마리아정
      </text>
      <text x="0" y="26" fontSize="9.5" fontFamily={FX} fill={M.inkMuted} letterSpacing="0.02em">
        SIJAE by MARIAJUNG
      </text>
    </g>
  </g>
);

const routeLeft =
  "M 60 240 Q 80 220 95 200 Q 115 175 135 150 Q 155 120 165 90 Q 172 65 178 48";
const routeRight =
  "M 300 240 Q 280 220 265 200 Q 245 175 225 150 Q 205 120 195 90 Q 188 65 182 48";

const SingleMap = () => (
  <MapSvg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="시재 바이 마리아정 약도">
    <g transform="translate(330, 30)" opacity="0.55">
      <circle cx="0" cy="0" r="11" fill="none" stroke={M.inkMuted} strokeWidth="0.8" />
      <path d="M0 -7 L2 0 L0 7 L-2 0 Z" fill={M.inkSoft} />
      <text x="0" y="-14" fontSize="8" fontFamily={FM} fill={M.inkMuted} textAnchor="middle">
        N
      </text>
    </g>

    <line x1="20" y1="262" x2="340" y2="262" stroke={M.hwy} strokeWidth="7" strokeLinecap="round" />
    <line
      x1="20"
      y1="262"
      x2="340"
      y2="262"
      stroke="#fff"
      strokeWidth="1"
      strokeDasharray="3 5"
      strokeLinecap="round"
      opacity="0.85"
    />
    <text x="180" y="284" fontSize="10" fontFamily={FM} fill={M.inkMuted} textAnchor="middle" letterSpacing="0.22em">
      YEONGDONG · 영동고속도로
    </text>

    <path d={routeLeft} stroke={M.road} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path
      d={routeLeft}
      stroke="#fff"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="2 5"
      opacity="0.7"
    />
    <path d={routeRight} stroke={M.road} strokeWidth="4" fill="none" strokeLinecap="round" />
    <path
      d={routeRight}
      stroke="#fff"
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="2 5"
      opacity="0.7"
    />

    <Landmark x={95} y={200} label="한터로" side="left" />
    <Landmark x={135} y={150} label="회전교차로" side="left" />
    <Landmark x={165} y={92} label="누비지오" side="left" muted />
    <Landmark x={265} y={200} label="까샤미아" side="right" />
    <Landmark x={225} y={150} label="양지바른" side="right" />

    <ICMarker x={60} y={240} label="용인" sub="from Seoul" />
    <ICMarker x={300} y={240} label="양지" sub="from Gangneung" />
    <VenuePin x={180} y={48} />

    <g transform="translate(20, 20)">
      <text x="0" y="0" fontFamily={FM} fontSize="9" fill={M.inkMuted} letterSpacing="0.22em">
        DIRECTIONS · 약도
      </text>
    </g>
  </MapSvg>
);

export default SingleMap;
