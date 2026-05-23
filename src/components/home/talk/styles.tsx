import styled, { css } from "styled-components";

import { BubbleHeadStyle, FM, T, TextSansStyle, TextSerifStyle } from "../styles";
import { Party } from "@/talk/types";

export const TalkHeadColors = [
  "#C9B79A",
  "#8E9582",
  "#A6B89C",
  "#D6B3A1",
  "#B7A6BF",
  "#9AAEC4",
];

export const TALK_ORNAMENTS = ["❦", "❀", "❁", "✿", "♡", "☘", "✦", "·"];

export const Wrap = styled.div`
  position: relative;
  width: 100%;
  max-height: calc(100svh - 40px);
  overflow: auto;
  border: 1px solid ${T.rule};
  border-radius: 10px;
  background: ${T.bg};
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
  text-align: start;
  ${TextSansStyle}

  input,
  textarea,
  button,
  label,
  div[contenteditable="true"] {
    appearance: none;
    transition: 160ms ease;
  }
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 0;
  text-align: center;
`;

export const Header = styled.h3`
  ${TextSerifStyle}
  margin: 8px 0 0;
  color: ${T.ink};
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.4;
  text-align: center;
`;

export const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
`;

export const StepDot = styled.span<{ $active: boolean }>`
  display: block;
  width: ${({ $active }) => ($active ? 20 : 6)}px;
  height: 6px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? T.accent : T.rule)};
  transition: width 220ms ease, background 220ms ease;
`;

export const ModalBody = styled.div`
  min-height: 200px;
  padding: 22px 24px 8px;
`;

export const PartyRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  input[type="radio"] {
    position: absolute;
    clip: rect(0, 0, 0, 0);
    pointer-events: none;
  }
`;

export const PartyLabel = styled.label`
  ${TextSerifStyle}
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  color: ${T.ink};
  background: transparent;
  font-size: 17px;
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-align: center;

  input[type="radio"]:checked + & {
    border-color: ${T.ink};
    color: ${T.paper};
    background: ${T.ink};
  }
`;

export const PartyButton = styled.button<{ $selected: boolean }>`
  ${TextSerifStyle}
  min-height: 72px;
  padding: 22px 0;
  border: 1px solid ${({ $selected }) => ($selected ? T.ink : T.rule)};
  border-radius: 6px;
  color: ${({ $selected }) => ($selected ? T.paper : T.ink)};
  background: ${({ $selected }) => ($selected ? T.ink : "transparent")};
  font-size: 17px;
  letter-spacing: 0.06em;
  line-height: 1.4;
`;

export const ComposerWrap = styled.div<{ $right: boolean }>`
  display: flex;
  flex-direction: ${({ $right }) => ($right ? "row-reverse" : "row")};
  gap: 10px;
  align-items: flex-start;
`;

export const ColorButton = styled.button<{ $color: string }>`
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 18px;
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
`;

export const ComposerFields = styled.div<{ $right: boolean }>`
  flex: 1;
  min-width: 0;
  text-align: ${({ $right }) => ($right ? "right" : "left")};
`;

export const AuthorField = styled.input<{ $right: boolean }>`
  ${TextSansStyle}
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 6px;
  padding: 8px 10px;
  border: 1px solid ${T.rule};
  border-radius: 4px;
  color: ${T.ink};
  background: transparent;
  font-size: 13px;
  line-height: 1.4;
  outline: none;
  text-align: ${({ $right }) => ($right ? "right" : "left")};
`;

export const MessageField = styled.textarea<{ $right: boolean }>`
  ${TextSansStyle}
  box-sizing: border-box;
  width: 100%;
  resize: none;
  padding: 10px 14px;
  border: 1px solid ${T.rule};
  border-radius: ${({ $right }) =>
    $right ? "12px 4px 12px 12px" : "4px 12px 12px 12px"};
  color: ${T.ink};
  background: ${T.paper};
  font-size: 13.5px;
  line-height: 1.55;
  outline: none;
`;

export const OrnamentRow = styled.div<{ $right: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ $right }) => ($right ? "flex-end" : "flex-start")};
  gap: 6px;
  margin-top: 8px;
`;

export const OrnamentButton = styled.button`
  ${TextSerifStyle}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid ${T.rule};
  border-radius: 4px;
  color: ${T.accent};
  background: ${T.bg};
  font-size: 14px;
`;

export const FieldMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  color: ${T.inkMuted};
  font-family: ${FM};
  font-size: 10.5px;
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-transform: uppercase;
`;

export const ErrorText = styled.span<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? "#B7472A" : T.inkMuted)};
`;

export const PasswordWrap = styled.div`
  text-align: center;

  label {
    ${TextSansStyle}
    display: block;
    margin: 0 0 14px;
    color: ${T.inkSoft};
    font-size: 13px;
    line-height: 1.7;
  }
`;

export const PasswordInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  color: ${T.ink};
  background: ${T.paper};
  font-family: ${FM};
  font-size: 18px;
  letter-spacing: 0.4em;
  text-align: center;
  outline: none;
`;

export const PasswordHelp = styled.p<{ $error?: boolean }>`
  margin: 8px 0 0;
  color: ${({ $error }) => ($error ? "#B7472A" : T.inkMuted)};
  font-family: ${FM};
  font-size: 10.5px;
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-align: center;
  text-transform: uppercase;
`;

export const ModalFooter = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) => ($single ? "1fr" : "1fr 1.4fr")};
  gap: 8px;
  padding: 8px 24px 24px;
`;

export const FooterButton = styled.button<{ $variant?: "primary" | "secondary" }>`
  ${TextSansStyle}
  min-height: 48px;
  padding: 14px 18px;
  border: 1px solid
    ${({ $variant }) => ($variant === "primary" ? T.primary : T.rule)};
  border-radius: 6px;
  color: ${({ $variant }) => ($variant === "primary" ? T.paper : T.ink)};
  background: ${({ $variant }) =>
    $variant === "primary" ? T.primary : "transparent"};
  font-size: 14px;
  font-weight: ${({ $variant }) => ($variant === "primary" ? 500 : 400)};
  letter-spacing: 0.02em;
  line-height: 1.35;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(20, 17, 13, 0.18);
`;

export const BubbleStyle = (party: Party) => css`
  ${TextSansStyle}
  display: inline-block;
  padding: 10px 14px;
  border: 1px solid ${T.rule};
  border-radius: ${party === "BRIDE"
    ? "12px 4px 12px 12px"
    : "4px 12px 12px 12px"};
  color: ${T.ink};
  background: ${T.paper};
  line-height: 1.5;
  outline: none;
  white-space: pre-wrap;

  &:not(:first-child) {
    margin: 6px 0 0;
  }
`;

export const BubbleWrap = styled.div<{ party: Party; color: string }>`
  margin: 24px 0;
  ${({ party }) =>
    party === "BRIDE"
      ? css`
          text-align: right;
        `
      : css`
          text-align: left;
        `}

  svg {
    ${({ party, color }) => BubbleHeadStyle(party, color)}
  }

  > div {
    ${({ party }) =>
      party === "BRIDE"
        ? css`
            margin-right: 46px;
            text-align: right;
          `
        : css`
            margin-left: 46px;
            text-align: left;
          `}
  }
`;

export const AuthorInput = styled.div<{ party: Party }>`
  ${({ party }) => BubbleStyle(party)}
  text-align: start;

  &:empty:before {
    content: "이름";
    color: ${T.inkMuted};
  }
`;

export const MsgInput = styled.div<{ party: Party }>`
  ${({ party }) => BubbleStyle(party)}
  word-break: break-all;
  overflow-wrap: break-word;
  text-align: start;

  &:empty:before {
    content: "내용을 입력해주세요.";
    color: ${T.inkMuted};
  }
`;

export const SubmitButton = styled.input<{ isValid: boolean }>`
  ${TextSansStyle}
  display: block;
  width: 100%;
  min-height: 48px;
  border: 1px solid ${T.primary};
  border-radius: 6px;
  margin: 24px auto 0;
  color: ${T.paper};
  background: ${T.primary};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;

  ${({ isValid }) =>
    !isValid &&
    css`
      opacity: 0.4;
    `}
`;
