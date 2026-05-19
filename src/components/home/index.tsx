import {
  Copy,
  EmojiLookLeft,
  EmojiLookRight,
  MessageText,
  Phone,
  Pin,
} from "iconoir-react";
import React, {
  Fragment,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { css } from "styled-components";
import useSWR from "swr";

import { useSessionStorage } from "@/common/hooks/useStorage";
import timeDiffFormat from "@/common/utils/timeDiffFormat";
import Modal from "@/components/common/Modal";
import { Content } from "@/content";
import { GetTalkListResponse, Party, Talk } from "@/talk/types";
import { InvitationVariant } from "@/variant";
import {
  BoxShadowStyle,
  BubbleHeadStyle,
  Main,
  SectionHeader,
  SectionHr,
  TextSansStyle,
} from "./styles";
import EditTalk from "./talk/EditTalk";
import WriteTalk from "./talk/WriteTalk";

const Hero = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #F5F1EA;
`;

const HeroInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  color: #5f6654;
  text-align: center;
`;

const HeroTree = styled.img`
  width: 164%;
  max-width: 840px;
  height: min(38svh, 360px);
  object-fit: contain;
  object-position: top center;
  margin: 0 0 -52px;
`;

const HeroDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 10px 0 18px;
  color: #9aa28d;

  span {
    width: 56px;
    height: 1px;
    background: rgba(120, 128, 108, 0.35);
  }

  em {
    font-size: 18px;
    font-style: normal;
  }
`;

const HeroKrNames = styled.p`
  margin: 0 0 24px;
  color: #5a5a50;
  font-family: "Noto Serif KR", serif;
  font-size: 22px;
  letter-spacing: 0;
`;

const HeroEventDetail = styled.p`
  margin: 0;
  color: #5f6654;
  font-family: "Noto Serif KR", serif;
  font-size: 16px;
  line-height: 1.9;
  letter-spacing: 0;
`;

const HeroActionWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const HeroActionButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  color: #666;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
  text-decoration: none;
  background: #f3f3f3;
`;

const HeroSectionHr = styled.hr`
  width: 100px;
  margin: 38px auto 0;
  border: 0;
  border-top: 1px solid #ccc;
`;

const FirstSectionHeader = styled(SectionHeader)`
  margin-top: 28px;
  margin-bottom: 24px;
`;

const InvitationHero = ({
  content: c,
  isInvitationVersion,
}: {
  content: Content;
  isInvitationVersion: boolean;
}) => (
  <Hero>
    <HeroInner>
      <HeroTree src="/tree_transparent.png" alt="연리지 나무" />

      <HeroDivider>
        <span />
        <em>❦</em>
        <span />
      </HeroDivider>

      <HeroKrNames>김민지 · 임석의</HeroKrNames>
      <HeroEventDetail>
        {c.datetime}
        <br />
        {c.venue.desc}
      </HeroEventDetail>
      {isInvitationVersion && c.rsvpFormUrl && (
        <HeroActionWrap>
          <HeroActionButton
            href={c.rsvpFormUrl}
            target="_blank"
            rel="noreferrer"
          >
            참석 의사 전달하기
          </HeroActionButton>
        </HeroActionWrap>
      )}
      <HeroSectionHr />
    </HeroInner>
  </Hero>
);

const GreetingP = styled.p`
  white-space: pre;
  margin: 30px 0;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 40px 0 20px;
  > * {
    margin: 0 15px;
  }
`;

const ContactTrigger = styled.button`
  padding: 0;
  border: 0;
  color: inherit;
  background: none;
`;

const CallButtonWrap = styled.div<{ $bgColor: string }>`
  ${TextSansStyle}
  width: 118px;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;

  svg {
    display: block;
    box-sizing: border-box;
    margin: 0 auto;
    margin-bottom: 4px;
    width: 60px;
    height: 60px;
    min-width: 60px;
    max-width: 60px;
    min-height: 60px;
    max-height: 60px;
    color: white;
    padding: 15px;
    border-radius: 30px;
    background-color: ${({ $bgColor }) => $bgColor};
  }
`;

const ContactList = styled.div`
  ${TextSansStyle}
  width: calc(100% - 40px);
  max-width: 340px;
  margin: 0 auto;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f3f3f3;
  text-align: left;
`;

const ContactRow = styled.div`
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #dddddd;

  &:first-child {
    border-top: 0;
  }
`;

const ContactText = styled.span`
  color: #555;
  font-size: 15px;
  line-height: 1.5;
  white-space: nowrap;
`;

const ContactActions = styled.div`
  display: flex;
  gap: 6px;

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
    color: #777;
  }
`;

const ContactName = styled(ContactText)`
  font-weight: 700;
`;

const ContactPhone = styled(ContactText)``;

const ContactModalCard = styled.div`
  width: calc(100% - 40px);
  max-width: 360px;
  margin: 0 auto;
  padding: 22px 0 18px;
  border-radius: 12px;
  background: #F5F1EA;
  text-align: center;
`;

const ContactModalTitle = styled.h3`
  margin: 0 0 16px;
  color: #333;
  font-family: "Noto Serif KR", serif;
  font-size: 20px;
  font-weight: 500;
`;

const ContactModalClose = styled.button`
  ${TextSansStyle}
  display: inline-block;
  padding: 7px 16px;
  border: 0;
  border-radius: 8px;
  margin-top: 16px;
  color: #666;
  font-size: 15px;
  font-weight: bold;
  background: #f3f3f3;
`;

type CallButtonProps = {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
};

const CallButton = ({ icon, bgColor, label }: CallButtonProps) => (
  <>
    <CallButtonWrap $bgColor={bgColor}>
      {icon}
      {label}
    </CallButtonWrap>
  </>
);

const brideContacts = [
  { label: "신부", phone: "010-3934-5499" },
  { label: "신부 아버님", phone: "010-3156-5286" },
  { label: "신부 어머님", phone: "010-8436-5286" },
];

const groomContacts = [
  { label: "신랑", phone: "010-4721-0265" },
  { label: "신랑 아버님", phone: "010-3592-9109" },
  { label: "신랑 어머님", phone: "010-3666-9109" },
];

type ContactItem = (typeof brideContacts)[number];

const ContactPanel = ({ contacts }: { contacts: ContactItem[] }) => (
  <ContactList>
    {contacts.map((contact) => {
      const phoneNumber = contact.phone.replaceAll("-", "");

      return (
        <ContactRow key={contact.phone}>
          <ContactName>{contact.label}</ContactName>
          <ContactPhone>{contact.phone}</ContactPhone>
          <ContactActions>
            <a href={`tel:${phoneNumber}`} aria-label={`${contact.label} 전화`}>
              <Phone />
            </a>
            <a href={`sms:${phoneNumber}`} aria-label={`${contact.label} 문자`}>
              <MessageText />
            </a>
          </ContactActions>
        </ContactRow>
      );
    })}
  </ContactList>
);

const ContactModal = ({
  contacts,
  title,
  onClose,
}: {
  contacts: ContactItem[];
  title: string;
  onClose: () => void;
}) => (
  <ContactModalCard>
    <ContactModalTitle>{title}</ContactModalTitle>
    <ContactPanel contacts={contacts} />
    <ContactModalClose type="button" onClick={onClose}>
      닫기
    </ContactModalClose>
  </ContactModalCard>
);

const DirectionsImageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: calc(100% - 40px);
  max-width: 360px;
  margin: 0 auto 24px;
`;

const DirectionsImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
`;

const WeddingPhoto = styled.img`
  display: block;
  width: calc(100% - 40px);
  max-width: 360px;
  height: auto;
  margin: 52px auto 20px;
  border-radius: 8px;
`;

const MapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #666;
  font-size: 15px;
  text-decoration: none;
  background: #f3f3f3;
  line-height: 1.3;
  > svg {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin: -4px 0;
    margin-right: 4px;
  }
`;

const GuideWrap = styled.div`
  display: inline-block;
  width: calc(100% - 60px);
  max-width: 340px;
  margin-top: 40px;
  text-align: center;
  line-height: 2;

  h3 {
    margin-top: 24px;
    font-size: 17px;
    font-weight: 500;
  }

  h3:first-child {
    margin-top: 0;
  }

  p {
    white-space: pre-line;
    margin: 6px 0 0;
  }
`;

const GuideActionWrap = styled.div`
  text-align: center;
`;

const GuideActionButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  margin-top: 12px;
  color: #666;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
  text-decoration: none;
  background: #f3f3f3;
`;

const RsvpInfoText = styled.p`
  white-space: pre-line;
  margin: 0 24px 18px;
  line-height: 2;
`;

const RsvpInfoButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  color: #666;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
  background: #f3f3f3;
`;

const GiveWrap = styled.div`
  display: inline-block;
  text-align: center;
  line-height: 2;
`;

const GiveGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CopyTextButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  line-height: 0;

  svg {
    width: 20px;
    height: 20px;
    padding: 2px;
    color: #999;
    vertical-align: sub;
  }
`;

const AccountRevealButton = styled.button`
  ${TextSansStyle}
  padding: 4px 10px;
  border: 0;
  border-radius: 8px;
  color: #666;
  font-size: 15px;
  font-weight: bold;
  background: #f3f3f3;
`;

const AccountList = styled.ul`
  ${TextSansStyle}
  width: 280px;
  margin: 0 auto;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f3f3f3;
  line-height: 1.5;
  text-align: left;

  li {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 6px 0;
    border-top: 1px solid #dddddd;
  }

  li:first-child {
    border-top: 0;
  }

  span {
    font-size: 14px;
    color: #555;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }
`;

type AccountItem = { name: string; account: string };

const AccountCopyButton = ({ text }: { text: string }) => {
  const handleCopyText = () => {
    const fallbackCopyClipboard = (value: string) => {
      const $text = document.createElement("textarea");
      document.body.appendChild($text);
      $text.value = value;
      $text.select();
      document.execCommand("copy");
      document.body.removeChild($text);
    };

    navigator.clipboard
      .writeText(text)
      .catch(() => fallbackCopyClipboard(text))
      .then(() => alert("계좌번호가 복사 되었습니다."));
  };

  return (
    <CopyTextButton type="button" onClick={handleCopyText} aria-label="복사">
      <Copy />
    </CopyTextButton>
  );
};

const AccountPanel = ({ accounts }: { accounts: AccountItem[] }) => (
  <AccountList>
    {accounts.map((account) => {
      const copyText = `${account.name} ${account.account}`;

      return (
        <li key={copyText}>
          <span>{copyText}</span>
          <AccountCopyButton text={copyText} />
        </li>
      );
    })}
  </AccountList>
);

const AccountModal = ({
  accounts,
  onClose,
  title,
}: {
  accounts: AccountItem[];
  onClose: () => void;
  title: string;
}) => (
  <ContactModalCard>
    <ContactModalTitle>{title}</ContactModalTitle>
    <AccountPanel accounts={accounts} />
    <ContactModalClose type="button" onClick={onClose}>
      닫기
    </ContactModalClose>
  </ContactModalCard>
);

const AccountReveal = ({
  accounts,
  title,
}: {
  accounts: AccountItem[];
  title: string;
}) => {
  const [isModalShown, setModalShown] = useState(false);

  return (
    <>
      <AccountRevealButton type="button" onClick={() => setModalShown(true)}>
        계좌번호 보기
      </AccountRevealButton>
      {isModalShown && (
        <Modal handleClose={() => setModalShown(false)}>
          <AccountModal
            accounts={accounts}
            title={title}
            onClose={() => setModalShown(false)}
          />
        </Modal>
      )}
    </>
  );
};

const guideSections = [
  {
    title: "주차안내",
    content: "예식장 내 주차 안내에 따라 편하게 주차하실 수 있습니다.",
  },
  {
    title: "전세버스 안내",
    content:
      "서울 출발 전세 버스를 운영 할 예정입니다. 참석 의사 전달 시 전세버스 탑승 여부를 기재해주세요. 추후 개별 안내 드릴 예정입니다.",
  },
  {
    title: "대중교통 안내",
    content: `용인공용버스터미널 근처 하차 → 택시 탑승
* 탑승 후 요금 청구 부탁드립니다.`,
    actionLabel: "청구하기",
    actionHref: "https://forms.gle/TmPzFpKV1kfuAgCi6",
  },
];

const WriteSectionSubHeader = styled.div`
  padding: 0 20px;
  margin-top: -68px;
  color: #666;
  p:first-child {
    float: left;
  }
  p:last-child {
    float: right;
  }
`;

const WriteButton = styled.button<{ $visible: boolean }>`
  ${TextSansStyle}
  ${({ $visible }) =>
    $visible
      ? css`
          bottom: 45px;
        `
      : css`
          bottom: -100px;
        `}

  position: fixed;
  left: 50%;
  transform: translateX(-50%);

  width: calc(100% - 40px);
  max-width: calc(400px - 40px);
  padding: 16px;
  border: 0;
  border-radius: 8px;

  color: white;
  font-size: 16px;
  font-weight: bold;
  background: rgba(255, 136, 170, 0.9);

  ${BoxShadowStyle}

  transition: bottom 0.5s cubic-bezier(0.68, -0.6, 0.32, 1.6);
`;

const TalkWrap = styled.div`
  position: relative;
  padding: 0 20px;
  margin: 20px 0;
`;

const WriteButtonTrigger = styled.div`
  position: absolute;
  top: 100px;
  height: 100%;
`;

const TalkBubbleWrap = styled.div<{
  party: Party;
  color: string;
  selected: boolean;
}>`
  ${TextSansStyle}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  svg {
    ${({ party, color }) => BubbleHeadStyle(party, color)}
  }
  > div {
    ${({ party }) =>
      party === "BRIDE"
        ? css`
            margin-right: 44px;
            text-align: right;
          `
        : css`
            margin-left: 44px;
            text-align: left;
          `}
    line-height: 1.3;
    div.bubble-info-wrap {
      display: flex;
      ${({ party }) =>
        party === "BRIDE"
          ? css`
              flex-direction: row-reverse;
            `
          : css`
              flex-direction: row;
            `}

      p {
        white-space: pre-wrap;
        text-align: left;
        word-break: break-all;
        overflow-wrap: break-word;
        display: inline-block;
        padding: 8px 12px;
        margin: 4px 0 0 0;
        ${({ party }) =>
          party === "BRIDE"
            ? css`
                border-radius: 20px 4px 20px 20px;
                margin-left: 3px;
              `
            : css`
                border-radius: 4px 20px 20px 20px;
                margin-right: 3px;
              `}
        background: #eee;
        ${({ selected }) =>
          selected &&
          css`
            background: #ddd;
          `}
      }
      small {
        align-self: flex-end;
        flex-shrink: 0;
        color: #999;
        font-size: 13px;
      }
    }
    .edit {
      font-size: 0.95em;
      color: #999;
      text-decoration: underline;
    }
  }
`;

type TalkBubbleProps = {
  talk: Talk;
  selected: boolean;
  onBubbleClick: (id: string | undefined) => void;
  onEditClick: (id: string) => void;
};
const TalkBubble = ({
  talk,
  selected,
  onBubbleClick,
  onEditClick,
}: TalkBubbleProps) => {
  const handleBubbleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onBubbleClick(talk.id);
  };
  const handleBubbleOutsideClick: MouseEventHandler = () =>
    onBubbleClick(undefined);
  const handleEditClick: MouseEventHandler = (e) => {
    e.stopPropagation();
    onEditClick(talk.id);
  };
  const editBtn = (
    <span className="edit" onClick={handleEditClick}>
      수정하기
    </span>
  );
  return (
    <TalkBubbleWrap party={talk.party} color={talk.color} selected={selected}>
      {talk.party === "BRIDE" ? <EmojiLookLeft /> : <EmojiLookRight />}
      <div onClick={handleBubbleOutsideClick}>
        {selected && talk.party === "BRIDE" && <>{editBtn} </>}
        {talk.author}
        {selected && talk.party === "GROOM" && <> {editBtn}</>}
        <div className="bubble-info-wrap">
          <p onClick={handleBubbleClick}>{talk.msg}</p>
          <small>
            {!talk.published
              ? "검수중"
              : timeDiffFormat(new Date(talk.created))}
          </small>
        </div>
      </div>
    </TalkBubbleWrap>
  );
};

const ThankYou = styled.div`
  padding: 60px;
  color: #666;
`;

type HomeProps = { content: Content; variant: InvitationVariant };

const Home = ({ content: c, variant }: HomeProps) => {
  const [writeDone, setWriteDone] = useSessionStorage("talk.writedone");
  const { data: talkListResp, mutate } =
    useSWR<GetTalkListResponse>("/api/talk/list");

  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
  const [showBrideContactModal, setShowBrideContactModal] = useState(false);
  const [showGroomContactModal, setShowGroomContactModal] = useState(false);
  const [isWriteButtonShown, setWriteButtonShown] = useState(false);
  const [selectedTalkId, setSelectedTalkId] = useState<string>();

  const writeButtonTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!writeButtonTriggerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setWriteButtonShown(entry.isIntersecting);
    });
    observer.observe(writeButtonTriggerRef.current);

    return () => observer.disconnect();
  }, [writeButtonTriggerRef]);

  const handleTalkBubbleClick = (id: string | undefined) =>
    setSelectedTalkId(id);

  const handleWriteButtonClick = () => setShowWriteTalkModal(true);
  const handleWriteTalk = () => {
    setWriteDone("done");
    setShowWriteTalkModal(false);
    mutate();
  };
  const handleWriteTalkModalClose = () => setShowWriteTalkModal(false);

  const handleTalkEditClick = (id: string) => {
    const talk = talkListResp?.talks?.find((t) => t.id === id);
    if (!talk) return;
    setShowEditTalkModal(talk);
    setSelectedTalkId(undefined);
  };
  const handleEditTalk = () => {
    setWriteDone("done");
    setShowEditTalkModal(undefined);
    mutate();
  };
  const handleEditTalkModalClose = () => setShowEditTalkModal(undefined);
  const isInvitationVersion = variant !== "nomap";

  return (
    <>
      <InvitationHero content={c} isInvitationVersion={isInvitationVersion} />
      <Main>
      <FirstSectionHeader>{c.greeting.title}</FirstSectionHeader>
      {c.greeting.content.map((p, i) => (
        <GreetingP key={i}>
          {p
            .split("\n")
            .map((l) => l.trim())
            .join("\n")}
        </GreetingP>
      ))}
      <CallWrap>
        <ContactTrigger
          type="button"
          onClick={() => setShowBrideContactModal(true)}
        >
          <CallButton
            icon={<EmojiLookLeft />}
            bgColor="#c2e0a3"
            label="신부 측에 연락하기"
          />
        </ContactTrigger>
        <ContactTrigger
          type="button"
          onClick={() => setShowGroomContactModal(true)}
        >
          <CallButton
            icon={<EmojiLookRight />}
            bgColor="#abdaab"
            label="신랑 측에 연락하기"
          />
        </ContactTrigger>
      </CallWrap>
      <WeddingPhoto src="/wed_photo.jpeg" alt="웨딩 사진" />
      {isInvitationVersion && (
        <>
          <SectionHr />
          <SectionHeader>오시는 길</SectionHeader>
          <DirectionsImageWrap>
            <DirectionsImage src="/directions1.jpeg" alt="오시는 길 안내 1" />
            <DirectionsImage src="/directions2.jpeg" alt="오시는 길 안내 2" />
          </DirectionsImageWrap>
          <p>
            {c.venue.address}
            <br />
            {c.venue.desc}
          </p>
          <MapButton href={c.venue.kakaoMapUrl}>
            <Pin color="#1199EE" /> 카카오맵
          </MapButton>
          <MapButton href={c.venue.naverMapUrl}>
            <Pin color="#66BB66" /> 네이버지도
          </MapButton>
          <GuideWrap>
            {guideSections.map((section) => (
              <Fragment key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.content}</p>
                {"actionLabel" in section && section.actionLabel && (
                  <GuideActionWrap>
                    <GuideActionButton
                      href={section.actionHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {section.actionLabel}
                    </GuideActionButton>
                  </GuideActionWrap>
                )}
              </Fragment>
            ))}
          </GuideWrap>
        </>
      )}
      <SectionHr />
      <SectionHeader>참석 여부 전달</SectionHeader>
      <RsvpInfoText>
        {`축하의 마음으로 참석해 주시는 한 분 한 분
귀한 마음으로 모실 수 있도록
부담 없이 알려주시면 정성을 다해 준비하겠습니다.`}
      </RsvpInfoText>
      {c.rsvpFormUrl && (
        <RsvpInfoButton href={c.rsvpFormUrl} target="_blank" rel="noreferrer">
          참석 의사 전달하기
        </RsvpInfoButton>
      )}
      <SectionHr />
      <SectionHeader>마음 전하실 곳</SectionHeader>
      <GiveWrap>
        <GiveGroup>
          <strong>신부측</strong>
          <br />
          <AccountReveal accounts={c.brideGive} title="신부측 계좌번호" />
        </GiveGroup>
        <GiveGroup>
          <strong>신랑측</strong>
          <br />
          <AccountReveal accounts={c.groomGive} title="신랑측 계좌번호" />
        </GiveGroup>
      </GiveWrap>
      <SectionHr />
      <SectionHeader>축하의 한마디</SectionHeader>
      <WriteSectionSubHeader>
        <p>신랑측</p>
        <p>신부측</p>
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {talkListResp?.talks.map((talk) => (
          <TalkBubble
            key={talk.id}
            talk={talk}
            selected={talk.id === selectedTalkId}
            onBubbleClick={handleTalkBubbleClick}
            onEditClick={handleTalkEditClick}
          />
        ))}
      </TalkWrap>
      <ThankYou>{writeDone ? "감사합니다." : ""}</ThankYou>
      {!writeDone && (
        <WriteButton
          $visible={isWriteButtonShown}
          onClick={handleWriteButtonClick}
        >
          😍 나도 한마디
        </WriteButton>
      )}
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} />
        </Modal>
      )}
      {showBrideContactModal && (
        <Modal handleClose={() => setShowBrideContactModal(false)}>
          <ContactModal
            contacts={brideContacts}
            title="신부 측 연락처"
            onClose={() => setShowBrideContactModal(false)}
          />
        </Modal>
      )}
      {showGroomContactModal && (
        <Modal handleClose={() => setShowGroomContactModal(false)}>
          <ContactModal
            contacts={groomContacts}
            title="신랑 측 연락처"
            onClose={() => setShowGroomContactModal(false)}
          />
        </Modal>
      )}
      {showEditTalkModal && (
        <Modal handleClose={handleEditTalkModalClose}>
          <EditTalk talk={showEditTalkModal} onEdit={handleEditTalk} />
        </Modal>
      )}
      </Main>
    </>
  );
};

export default Home;
