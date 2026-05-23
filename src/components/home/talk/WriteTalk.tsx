import randomInt from "@/common/utils/randomInt";
import { FormEventHandler, useEffect, useRef, useState } from "react";

import { Party, PostTalkRequest, PostTalkResponse } from "@/talk/types";
import { Kicker } from "../styles";
import {
  AuthorField,
  ColorButton,
  ComposerFields,
  ComposerWrap,
  ErrorText,
  FieldMeta,
  FooterButton,
  Header,
  LoadingOverlay,
  MessageField,
  ModalBody,
  ModalFooter,
  ModalHeader,
  OrnamentButton,
  OrnamentRow,
  PartyButton,
  PartyRow,
  PasswordHelp,
  PasswordInput,
  PasswordWrap,
  StepDot,
  StepIndicator,
  TALK_ORNAMENTS,
  TalkHeadColors,
  Wrap,
} from "./styles";

type WriteTalkProps = { onWrite: (id: string) => void };
type Step = 1 | 2 | 3;

const getStepTitle = (step: Step) => {
  if (step === 1) return "어느 쪽으로 보내시나요?";
  if (step === 2) return "메시지를 남겨주세요";
  return "암호를 설정해주세요";
};

const WriteTalk = ({ onWrite }: WriteTalkProps) => {
  const [isLoading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>(1);
  const [party, setParty] = useState<Party>();
  const [colorIndex, setColorIndex] = useState(
    randomInt(0, TalkHeadColors.length - 1)
  );
  const [author, setAuthor] = useState("");
  const [msg, setMsg] = useState("");
  const [password, setPassword] = useState("");

  const authorInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const color = TalkHeadColors[colorIndex % TalkHeadColors.length];
  const isRight = party === "BRIDE";

  const authorErrMsg =
    author.length === 0
      ? "이름을 입력해주세요"
      : author.length > 10
      ? "이름이 너무 길어요"
      : undefined;
  const msgErrMsg =
    msg.length === 0
      ? "내용을 입력해주세요"
      : msg.length < 5
      ? "5자 이상 입력해주세요"
      : msg.length > 100
      ? "100자 이하로 입력해주세요"
      : undefined;
  const passwordErrMsg =
    password.length === 0
      ? "암호를 입력해주세요"
      : password.length < 4
      ? "4자 이상 입력해주세요"
      : undefined;

  const step2ErrMsg = authorErrMsg ?? msgErrMsg;
  const step3ErrMsg = passwordErrMsg;
  const nextDisabled =
    (step === 1 && !party) ||
    (step === 2 && !!step2ErrMsg) ||
    (step === 3 && !!step3ErrMsg);

  useEffect(() => {
    if (step !== 2) return;
    authorInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;
    passwordInputRef.current?.focus();
  }, [step]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!party) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (step2ErrMsg) return;
      setStep(3);
      return;
    }

    if (!party || step3ErrMsg) return;

    try {
      setLoading(true);

      const data: PostTalkRequest = { party, color, author, msg, password };

      const resp = await fetch("/api/talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const { id } = (await resp.json()) as PostTalkResponse;

      onWrite(id);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep((currentStep) => (currentStep === 3 ? 2 : 1));
  };

  const handleOrnamentClick = (ornament: string) => {
    setMsg((currentMsg) => `${currentMsg}${ornament}`.slice(0, 100));
  };

  return (
    <Wrap>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <Kicker>Guestbook · 한마디 남기기</Kicker>
          <Header>{getStepTitle(step)}</Header>
          <StepIndicator>
            {[1, 2, 3].map((stepNumber) => (
              <StepDot key={stepNumber} $active={stepNumber === step} />
            ))}
          </StepIndicator>
        </ModalHeader>

        <ModalBody>
          {step === 1 && (
            <PartyRow>
              <PartyButton
                type="button"
                $selected={party === "GROOM"}
                onClick={() => setParty("GROOM")}
              >
                신랑측
              </PartyButton>
              <PartyButton
                type="button"
                $selected={party === "BRIDE"}
                onClick={() => setParty("BRIDE")}
              >
                신부측
              </PartyButton>
            </PartyRow>
          )}

          {step === 2 && (
            <ComposerWrap $right={isRight}>
              <ColorButton
                type="button"
                $color={color}
                title="색상 변경"
                onClick={() => setColorIndex((index) => index + 1)}
              />
              <ComposerFields $right={isRight}>
                <AuthorField
                  ref={authorInputRef}
                  $right={isRight}
                  value={author}
                  placeholder="이름"
                  onChange={(e) => setAuthor(e.currentTarget.value)}
                />
                <MessageField
                  $right={isRight}
                  value={msg}
                  placeholder="축하의 한마디를 남겨주세요."
                  rows={4}
                  maxLength={100}
                  onChange={(e) => setMsg(e.currentTarget.value)}
                />
                <OrnamentRow $right={isRight}>
                  {TALK_ORNAMENTS.map((ornament) => (
                    <OrnamentButton
                      key={ornament}
                      type="button"
                      aria-label={`오너먼트 ${ornament} 삽입`}
                      onClick={() => handleOrnamentClick(ornament)}
                    >
                      {ornament}
                    </OrnamentButton>
                  ))}
                </OrnamentRow>
                <FieldMeta>
                  <ErrorText $error={!!step2ErrMsg}>
                    {step2ErrMsg || "동그라미를 탭하면 색이 바뀌어요"}
                  </ErrorText>
                  <span>{msg.length}/100</span>
                </FieldMeta>
              </ComposerFields>
            </ComposerWrap>
          )}

          {step === 3 && (
            <PasswordWrap>
              <label htmlFor="password">
                나중에 글을 수정·삭제할 때 사용할 4자 이상의 암호를 입력해주세요.
              </label>
              <PasswordInput
                ref={passwordInputRef}
                id="password"
                type="password"
                value={password}
                placeholder="••••"
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <PasswordHelp $error={!!step3ErrMsg}>
                {step3ErrMsg || "minimum 4 characters"}
              </PasswordHelp>
            </PasswordWrap>
          )}
        </ModalBody>

        <ModalFooter $single={step === 1}>
          {step !== 1 && (
            <FooterButton type="button" onClick={handleBack}>
              이전
            </FooterButton>
          )}
          <FooterButton
            type="submit"
            $variant="primary"
            disabled={nextDisabled || isLoading}
          >
            {step === 3 ? "한마디 등록" : "다음"}
          </FooterButton>
        </ModalFooter>
      </form>
      {isLoading && <LoadingOverlay />}
    </Wrap>
  );
};

export default WriteTalk;
