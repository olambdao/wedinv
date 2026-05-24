import styled, { css } from "styled-components";
import type { ReactNode } from "react";
import { Party } from "@/talk/types";

export type BubbleAlignment = "left" | "right";

export const T = {
  bg: "#F5F1EA",
  bgSoft: "#EDE7DA",
  paper: "#FBF8F1",
  ink: "#2A2620",
  inkSoft: "#4F4A41",
  inkMuted: "#8C8578",
  rule: "rgba(42,38,32,0.12)",
  accent: "#5F6654",
  accentSft: "#8E9582",
  primary: "#2A2620",
} as const;

export const FS = `"Noto Serif KR", "Nanum Myeongjo", serif`;
export const FX = `-apple-system, "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif`;
export const FM = `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;

export const TextSerifStyle = css`
  font-family: ${FS};
`;
export const TextSansStyle = css`
  font-family: ${FX};
`;
export const TextMonoStyle = css`
  font-family: ${FM};
`;

export const BoxShadowStyle = css`
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

export const Main = styled.main`
  ${TextSerifStyle}

  max-width: 400px;
  margin: 0 auto;

  font-size: 16px;
  color: ${T.ink};
  line-height: 1.85;
  background: ${T.bg};

  a:link,
  a:visited,
  a:hover {
    text-decoration: none;
    color: inherit;
  }

  button {
    outline: none;
    &:hover {
      cursor: pointer;
    }
  }

  strong {
    font-weight: 500;
  }
`;

export const SectionHr = styled.hr`
  width: 84px;
  margin: 64px auto;
  border: 0;
  border-top: 1px solid ${T.accentSft};
`;

const Dot = styled.span`
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 4px;
  background: ${T.accentSft};
`;

const Rule = styled.span`
  display: inline-block;
  width: 28px;
  height: 1px;
  background: ${T.accentSft};
`;

const Ornament = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const Kicker = styled.div`
  ${TextMonoStyle}
  color: ${T.accent};
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.22em;
  line-height: 1.4;
  text-transform: uppercase;
`;

export const SectionBreak = () => (
  <div
    style={{ display: "flex", justifyContent: "center", margin: "64px 0" }}
  >
    <Ornament>
      <Rule />
      <Dot />
      <Rule />
    </Ornament>
  </div>
);

export const SectionHeaderWrap = styled.div`
  margin-bottom: 28px;
  padding: 0 16px;
  text-align: center;
`;

export const SectionHeaderKicker = styled(Kicker)`
  margin-bottom: 12px;
`;

export const SectionHeaderTitle = styled.h2`
  ${TextSerifStyle}
  margin: 0;
  color: ${T.ink};
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.4;
`;

export const SectionHeaderSub = styled.p`
  ${TextSansStyle}
  margin: 8px 0 0;
  color: ${T.inkMuted};
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-line;
`;

export const SectionHeader = ({
  kicker,
  title,
  sub,
  children,
  className,
}: {
  kicker?: string;
  title?: ReactNode;
  sub?: string;
  children?: ReactNode;
  className?: string;
}) => (
  <SectionHeaderWrap className={className}>
    {kicker && <SectionHeaderKicker>{kicker}</SectionHeaderKicker>}
    <SectionHeaderTitle>{title ?? children}</SectionHeaderTitle>
    {sub && <SectionHeaderSub>{sub}</SectionHeaderSub>}
  </SectionHeaderWrap>
);

export type BtnVariant = "primary" | "secondary" | "tertiary";

export const Btn = styled.button<{ $variant?: BtnVariant; $full?: boolean }>`
  ${TextSansStyle}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${({ $full }) => ($full ? "100%" : "auto")};
  min-height: ${({ $variant }) => ($variant === "tertiary" ? "0" : "48px")};
  padding: ${({ $variant }) =>
    $variant === "tertiary" ? "8px 14px" : "14px 18px"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "primary"
        ? T.primary
        : $variant === "tertiary"
        ? "transparent"
        : T.rule};
  border-radius: ${({ $variant }) =>
    $variant === "tertiary" ? "100px" : "6px"};
  color: ${({ $variant }) =>
    $variant === "primary" ? T.paper : T.ink};
  background: ${({ $variant }) =>
    $variant === "primary"
      ? T.primary
      : $variant === "tertiary"
      ? "rgba(42,38,32,0.05)"
      : "transparent"};
  font-size: ${({ $variant }) => ($variant === "tertiary" ? "13px" : "14px")};
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.35;
  text-decoration: none;

  &&,
  &&:link,
  &&:visited,
  &&:hover {
    color: ${({ $variant }) =>
      $variant === "primary" ? T.paper : T.ink};
    text-decoration: none;
  }

  svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
  }
`;

export const BubbleHeadStyle = (
  party: Party,
  color: string,
  alignment: BubbleAlignment = party === "BRIDE" ? "right" : "left"
) => css`
  ${alignment === "right"
    ? css`
        float: right;
      `
    : css`
        float: left;
      `}
  background: ${color};
  width: 38px;
  height: 38px;
  color: white;
  padding: 8px;
  border-radius: 20px;
`;
