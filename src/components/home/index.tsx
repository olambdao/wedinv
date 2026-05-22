import {
  ArrowRight,
  Bus,
  Calendar,
  Car,
  Copy,
  EmojiLookLeft,
  EmojiLookRight,
  MessageText,
  Phone,
  Pin,
  Train,
} from "iconoir-react";
import React, {
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
import {
  getOrderedInvitationSides,
  InvitationSide,
  InvitationVariant,
} from "@/variant";
import {
  BubbleAlignment,
  BoxShadowStyle,
  BubbleHeadStyle,
  Btn,
  Kicker,
  Main,
  SectionHeader,
  SectionHr,
  T,
  TextSansStyle,
  TextSerifStyle,
} from "./styles";
import SingleMap from "./SingleMap";
import EditTalk from "./talk/EditTalk";
import WriteTalk from "./talk/WriteTalk";

const Hero = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 56px 0 48px;
  background: ${T.bg};
  text-align: center;
`;

const HeroInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
  padding: 0 24px;
  color: ${T.ink};
  text-align: center;
`;

const HeroTree = styled.img`
  display: block;
  width: 62%;
  max-width: 240px;
  height: auto;
  object-fit: contain;
  object-position: top center;
  margin: 28px auto 8px;
  opacity: 0.95;
`;

const HeroNames = styled.h1`
  margin: 12px 0 18px;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.2;
`;

const HeroNameDot = styled.span`
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 14px;
  border-radius: 5px;
  background: ${T.accent};
  vertical-align: 8px;
`;

const HeroDateWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;

  span {
    width: 20px;
    height: 1px;
    background: ${T.accentSft};
  }
`;

const HeroDate = styled.p`
  margin: 0;
  color: ${T.accent};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  letter-spacing: 0.32em;
  line-height: 1.4;
`;

const HeroEventDetail = styled.p`
  margin: 0;
  color: ${T.inkSoft};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 15px;
  line-height: 1.8;
  letter-spacing: 0.02em;
`;

const HeroActionWrap = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
  margin-top: 32px;
  padding: 0 12px;
`;

const FirstSectionHeader = styled(SectionHeader)`
  margin-top: 72px;
`;

const HeroKicker = styled(Kicker)`
  padding: 0 24px;
`;

const getSideFullName = (content: Content, side: InvitationSide) =>
  side === "groom" ? content.groomFullName : content.brideFullName;

const getSideFamilyLine = (content: Content, side: InvitationSide) =>
  side === "groom" ? content.greeting.groomFamily : content.greeting.brideFamily;

const getPartyInvitationSide = (party: Party): InvitationSide =>
  party === "GROOM" ? "groom" : "bride";

const getPartyAlignment = (
  party: Party,
  primarySide: InvitationSide
): BubbleAlignment =>
  getPartyInvitationSide(party) === primarySide ? "left" : "right";

const getAlignmentIcon = (alignment: BubbleAlignment) =>
  alignment === "right" ? <EmojiLookLeft /> : <EmojiLookRight />;

const formatHeroDate = (start: string) => {
  const match = start.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return "2026 . 06 . 27 · SAT";

  const [, year, month, day] = match;
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Seoul",
  })
    .format(new Date(`${year}-${month}-${day}T00:00:00+09:00`))
    .toUpperCase();

  return `${year} . ${month} . ${day} · ${weekday}`;
};

const getEventTimeText = (datetime: string) => {
  const match = datetime.match(/(오전|오후)\s*\d+시(?:\s*\d+분)?/);
  return match?.[0] ?? datetime;
};

const getCalendarUrl = (content: Content) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: content.calendarEvent.title,
    dates: `${content.calendarEvent.start}/${content.calendarEvent.end}`,
    ctz: content.calendarEvent.timeZone,
    location: content.calendarEvent.location,
    details: content.calendarEvent.details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const InvitationHero = ({
  content: c,
  isInvitationVersion,
  primarySide,
}: {
  content: Content;
  isInvitationVersion: boolean;
  primarySide: InvitationSide;
}) => {
  const orderedNames = getOrderedInvitationSides(primarySide).map((side) =>
    getSideFullName(c, side)
  );
  const calendarUrl = getCalendarUrl(c);

  return (
    <Hero>
      <HeroInner>
        <HeroKicker>We Invite You · 결혼합니다</HeroKicker>
        <HeroTree src="/tree_transparent.png" alt="연리지 나무" />

        <HeroNames>
          <span>{orderedNames[0]}</span>
          <HeroNameDot />
          <span>{orderedNames[1]}</span>
        </HeroNames>

        <HeroDateWrap>
          <span />
          <HeroDate>{formatHeroDate(c.calendarEvent.start)}</HeroDate>
          <span />
        </HeroDateWrap>

        <HeroEventDetail>
          {getEventTimeText(c.datetime)}
          <br />
          {c.venue.desc}
        </HeroEventDetail>
        {isInvitationVersion && (
          <HeroActionWrap>
            {c.rsvpFormUrl && (
              <Btn
                as="a"
                href={c.rsvpFormUrl}
                target="_blank"
                rel="noreferrer"
                $variant="primary"
                $full
              >
                <ArrowRight />
                참석 의사 전달하기
              </Btn>
            )}
            <Btn
              as="a"
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              $variant="secondary"
              $full
            >
              <Calendar />
              캘린더에 추가
            </Btn>
          </HeroActionWrap>
        )}
      </HeroInner>
    </Hero>
  );
};

const GreetingP = styled.p`
  margin: 0;
  padding: 0 28px;
  color: ${T.inkSoft};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 16px;
  letter-spacing: 0.02em;
  line-height: 1.95;
  text-align: center;
  white-space: pre-line;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 28px 24px 0;
`;

const ContactTrigger = styled.button`
  ${TextSansStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 18px;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  color: ${T.ink};
  background: transparent;
  font-size: 14px;
  line-height: 1.35;

  span {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${T.accent};
  }

  > svg:last-child {
    color: ${T.inkMuted};
  }
`;

const ParentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 36px 28px 0;
  padding-top: 28px;
  border-top: 1px solid ${T.rule};
`;

const ParentCard = styled.div<{ $withBorder: boolean }>`
  padding: 4px 12px;
  border-left: ${({ $withBorder }) =>
    $withBorder ? `1px solid ${T.rule}` : 0};
  color: ${T.inkSoft};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 13.5px;
  line-height: 1.9;
`;

const ParentSide = styled(Kicker)`
  margin-bottom: 6px;
  color: ${T.inkMuted};
`;

const ParentRole = styled.div`
  color: ${T.inkMuted};
  font-size: 12px;
`;

const ParentChildName = styled.div`
  margin-top: 4px;
  color: ${T.ink};
  font-size: 18px;
  letter-spacing: 0.06em;
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

const parseFamilyLine = (line: string) => {
  const match = line.match(/^(.+?)의\s+(.+)\s+(\S+)$/);

  if (!match) {
    return { parents: line, role: "", name: "" };
  }

  return {
    parents: match[1],
    role: `의 ${match[2]}`,
    name: match[3],
  };
};

const DirectionsWrap = styled.section`
  padding-top: 72px;
`;

const DirectionsContent = styled.div`
  padding: 0 24px;
`;

const VenueCard = styled.div`
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid ${T.rule};
  background: ${T.paper};
  text-align: center;
`;

const VenueName = styled.p`
  margin: 0;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 17px;
  letter-spacing: 0.04em;
  line-height: 1.5;
`;

const VenueAddress = styled.p`
  ${TextSansStyle}
  margin: 4px 0 14px;
  color: ${T.inkMuted};
  font-size: 12.5px;
  letter-spacing: 0.02em;
  line-height: 1.6;
`;

const MapButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
`;

const MapFrame = styled.div`
  width: 100%;
`;

const TransportList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
`;

const TransportCard = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid ${T.rule};
  text-align: left;
`;

const TransportIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  color: ${T.accent};
  background: ${T.bgSoft};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TransportTitle = styled.h3`
  margin: 0 0 4px;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.5;
`;

const TransportText = styled.p`
  ${TextSansStyle}
  margin: 0;
  color: ${T.inkSoft};
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-line;
`;

const TransportTitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;

const ShuttleMoreButton = styled.button`
  ${TextSansStyle}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  color: ${T.accent};
  background: transparent;
  font-size: 12px;
  letter-spacing: 0.02em;
  line-height: 1.4;
  white-space: nowrap;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ShuttleSummary = styled.div`
  padding: 4px 12px;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  background: ${T.paper};
`;

const ShuttleHint = styled.p`
  ${TextSansStyle}
  margin: 8px 0 0;
  color: ${T.inkMuted};
  font-size: 12px;
  line-height: 1.6;
`;

const ShuttleModalCard = styled.div`
  width: calc(100% - 40px);
  max-width: 360px;
  max-height: calc(100svh - 40px);
  overflow: auto;
  margin: 0 auto;
  border: 1px solid ${T.rule};
  border-radius: 10px;
  background: ${T.bg};
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
`;

const ShuttleModalHeader = styled.div`
  padding: 24px 24px 8px;
  text-align: center;
`;

const ShuttleModalTitle = styled.h3`
  margin: 8px 0 0;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.4;
`;

const ShuttleModalSub = styled.p`
  ${TextSansStyle}
  margin: 6px 0 0;
  color: ${T.inkMuted};
  font-size: 12.5px;
  line-height: 1.6;
`;

const ShuttleModalBody = styled.div`
  padding: 8px 24px 16px;
`;

const ShuttleDetailBox = styled.div`
  padding: 4px 14px;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  background: ${T.paper};
`;

const DetailRowWrap = styled.div<{ $last?: boolean }>`
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 12px 0;
  border-bottom: ${({ $last }) => ($last ? 0 : `1px solid ${T.rule}`)};
`;

const DetailLabel = styled.div`
  color: ${T.accent};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  line-height: 1.5;
  text-transform: uppercase;
`;

const DetailValue = styled.div`
  ${TextSansStyle}
  color: ${T.ink};
  font-size: 13.5px;
  line-height: 1.65;
  white-space: pre-line;
`;

const ShuttlePhoneLink = styled.a`
  ${TextSansStyle}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 4px 8px;
  border: 1px solid ${T.rule};
  border-radius: 100px;
  color: ${T.accent};
  font-size: 12px;
  line-height: 1.4;
  text-decoration: none;

  &&,
  &&:link,
  &&:visited,
  &&:hover {
    color: ${T.accent};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ShuttleModalFooter = styled.div`
  padding: 0 24px 24px;
`;

const RsvpWrap = styled.section`
  padding-top: 72px;
`;

const RsvpContent = styled.div`
  padding: 0 24px;
`;

const RsvpMeta = styled.p`
  margin: 14px 0 0;
  color: ${T.inkMuted};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  line-height: 1.5;
  text-align: center;
  text-transform: uppercase;
`;

const GiveWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px;
`;

const GiveGroup = styled.div`
  overflow: hidden;
  border: 1px solid ${T.rule};
  border-radius: 6px;
`;

const CopyTextButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 16px;
  background: #ffffff;

  svg {
    width: 18px;
    height: 18px;
    color: #999;
  }
`;

const AccountRevealButton = styled.button`
  ${TextSerifStyle}
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 18px;
  border: 0;
  color: ${T.ink};
  background: transparent;
  font-size: 14px;
  line-height: 1.35;
  text-align: left;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${T.inkMuted};
    transition: transform 200ms ease;
  }
`;

const AccountRevealArrow = styled(ArrowRight)<{ $open: boolean }>`
  transform: ${({ $open }) => ($open ? "rotate(90deg)" : "none")};
`;

const AccountList = styled.div`
  background: ${T.paper};
  border-top: 1px solid ${T.rule};
`;

const AccountRow = styled.div`
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 36px;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid ${T.rule};

  &:first-child {
    border-top: 0;
  }
`;

const AccountName = styled(ContactText)`
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 14px;
  font-weight: 400;
`;

const AccountNumber = styled(ContactText)`
  color: ${T.inkSoft};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
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
        <AccountRow key={copyText}>
          <AccountName>{account.name}</AccountName>
          <AccountNumber>{account.account}</AccountNumber>
          <AccountCopyButton text={copyText} />
        </AccountRow>
      );
    })}
  </AccountList>
);

const AccountReveal = ({
  accounts,
  title,
}: {
  accounts: AccountItem[];
  title: string;
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <AccountRevealButton
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpen((open) => !open)}
      >
        <span>
          <Kicker>{title.replace(" 계좌번호", "")}</Kicker>
          <span>계좌 안내</span>
        </span>
        <AccountRevealArrow $open={isOpen} />
      </AccountRevealButton>
      {isOpen && <AccountPanel accounts={accounts} />}
    </>
  );
};

type TransportSection = {
  title: string;
  content: string;
  icon: React.ReactNode;
};
const transportSections: TransportSection[] = [
  {
    title: "자가용",
    content: "영동고속 양지 IC 또는 용인 IC에서 약 10분.\n예식장 내 무료 주차 가능합니다.",
    icon: <Car />,
  },
  {
    title: "대중교통",
    content: "용인공용버스터미널 하차 → 택시로 약 15분.",
    icon: <Train />,
  },
];

const shuttle = {
  departTime: "2026. 06. 27 (토) 오전 10:30",
  departPlace: "서울 강남역 6번 출구 앞",
  returnTime: "2026. 06. 27 (토) 오후 4:00 (예식 종료 후 출발)",
  notes:
    "· 좌석은 RSVP 접수 순으로 배정됩니다.\n· 정원 초과 시 추가 차량을 운영할 수 있습니다.\n· 출발 30분 전 도착 부탁드립니다.",
  contactName: "신랑측",
  contactPhone: groomContacts[0].phone,
};

const DetailRow = ({
  children,
  label,
  last,
}: {
  children: React.ReactNode;
  label: string;
  last?: boolean;
}) => (
  <DetailRowWrap $last={last}>
    <DetailLabel>{label}</DetailLabel>
    <DetailValue>{children}</DetailValue>
  </DetailRowWrap>
);

const ShuttleCard = ({ onOpen }: { onOpen: () => void }) => (
  <TransportCard>
    <TransportIcon>
      <Bus />
    </TransportIcon>
    <div>
      <TransportTitleRow>
        <TransportTitle>전세버스</TransportTitle>
        <ShuttleMoreButton type="button" onClick={onOpen}>
          자세히 보기
          <ArrowRight />
        </ShuttleMoreButton>
      </TransportTitleRow>
      <ShuttleSummary>
        <DetailRow label="출발일시">{shuttle.departTime}</DetailRow>
        <DetailRow label="탑승장소" last>
          {shuttle.departPlace}
        </DetailRow>
      </ShuttleSummary>
      <ShuttleHint>RSVP 시 탑승 여부를 함께 전달해 주세요.</ShuttleHint>
    </div>
  </TransportCard>
);

const ShuttleModal = ({ onClose }: { onClose: () => void }) => (
  <ShuttleModalCard>
    <ShuttleModalHeader>
      <Kicker>Shuttle bus · 전세버스 안내</Kicker>
      <ShuttleModalTitle>서울 출발 전세버스</ShuttleModalTitle>
      <ShuttleModalSub>
        RSVP 시 탑승 여부를 함께 전달해 주세요.
      </ShuttleModalSub>
    </ShuttleModalHeader>
    <ShuttleModalBody>
      <ShuttleDetailBox>
        <DetailRow label="출발일시">{shuttle.departTime}</DetailRow>
        <DetailRow label="탑승장소">{shuttle.departPlace}</DetailRow>
        <DetailRow label="복귀일시">{shuttle.returnTime}</DetailRow>
        <DetailRow label="추가 안내">{shuttle.notes}</DetailRow>
        <DetailRow label="탑승 문의" last>
          {shuttle.contactName}
          <div>
            <ShuttlePhoneLink href={`tel:${shuttle.contactPhone.replaceAll("-", "")}`}>
              <Phone />
              {shuttle.contactPhone}
            </ShuttlePhoneLink>
          </div>
        </DetailRow>
      </ShuttleDetailBox>
    </ShuttleModalBody>
    <ShuttleModalFooter>
      <Btn type="button" $variant="primary" $full onClick={onClose}>
        닫기
      </Btn>
    </ShuttleModalFooter>
  </ShuttleModalCard>
);

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
  min-height: 48px;
  padding: 14px 18px;
  border: 1px solid ${T.rule};
  border-radius: 6px;

  color: ${T.ink};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: rgba(251, 248, 241, 0.96);

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
  $party: Party;
  $color: string;
  $selected: boolean;
  $primarySide: InvitationSide;
}>`
  ${TextSansStyle}
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  svg {
    ${({ $party, $color, $primarySide }) =>
      BubbleHeadStyle($party, $color, getPartyAlignment($party, $primarySide))}
  }
  > div {
    ${({ $party, $primarySide }) =>
      getPartyAlignment($party, $primarySide) === "right"
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
      ${({ $party, $primarySide }) =>
        getPartyAlignment($party, $primarySide) === "right"
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
        ${({ $party, $primarySide }) =>
          getPartyAlignment($party, $primarySide) === "right"
            ? css`
                border-radius: 20px 4px 20px 20px;
                margin-left: 3px;
              `
            : css`
                border-radius: 4px 20px 20px 20px;
                margin-right: 3px;
              `}
        background: #eee;
        ${({ $selected }) =>
          $selected &&
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
  primarySide: InvitationSide;
  onBubbleClick: (id: string | undefined) => void;
  onEditClick: (id: string) => void;
};
const TalkBubble = ({
  talk,
  selected,
  primarySide,
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
  const alignment = getPartyAlignment(talk.party, primarySide);

  return (
    <TalkBubbleWrap
      $party={talk.party}
      $color={talk.color}
      $selected={selected}
      $primarySide={primarySide}
    >
      {getAlignmentIcon(alignment)}
      <div onClick={handleBubbleOutsideClick}>
        {selected && alignment === "right" && <>{editBtn} </>}
        {talk.author}
        {selected && alignment === "left" && <> {editBtn}</>}
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

const ClosingSection = styled.section`
  padding: 88px 0 64px;
  text-align: center;
`;

const ClosingOrnament = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  span {
    display: inline-block;
  }

  span:nth-child(1),
  span:nth-child(3) {
    width: 28px;
    height: 1px;
    background: ${T.accentSft};
  }

  span:nth-child(2) {
    width: 4px;
    height: 4px;
    border-radius: 4px;
    background: ${T.accentSft};
  }
`;

const Monogram = styled.div`
  margin-top: 28px;
  text-align: center;
`;

const MonogramNames = styled.div`
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 46px;
  font-weight: 400;
  letter-spacing: 0.18em;
  line-height: 1.2;
`;

const MonogramDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 0 14px;
  border-radius: 6px;
  background: ${T.accent};
  vertical-align: 12px;
`;

const MonogramDate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;

  span {
    width: 36px;
    height: 1px;
    background: ${T.accentSft};
  }
`;

const ClosingThanks = styled.p`
  margin: 18px 0 0;
  color: ${T.inkMuted};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 13px;
  letter-spacing: 0.04em;
  line-height: 1.6;
`;

type HomeProps = {
  content: Content;
  variant: InvitationVariant;
  primarySide: InvitationSide;
};

const Home = ({ content: c, variant, primarySide }: HomeProps) => {
  const [writeDone, setWriteDone] = useSessionStorage("talk.writedone");
  const { data: talkListResp, mutate } =
    useSWR<GetTalkListResponse>("/api/talk/list");

  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
  const [showBrideContactModal, setShowBrideContactModal] = useState(false);
  const [showGroomContactModal, setShowGroomContactModal] = useState(false);
  const [showShuttleModal, setShowShuttleModal] = useState(false);
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
  const handleCopyAddress = () => {
    navigator.clipboard
      .writeText(c.venue.address)
      .catch(() => {
        const $text = document.createElement("textarea");
        document.body.appendChild($text);
        $text.value = c.venue.address;
        $text.select();
        document.execCommand("copy");
        document.body.removeChild($text);
      })
      .then(() => alert("주소가 복사 되었습니다."));
  };
  const isInvitationVersion = variant !== "nomap";
  const orderedSides = getOrderedInvitationSides(primarySide);
  const greetingParagraphs = c.greeting.content;
  const sideContent = {
    bride: {
      accountTitle: "신부측 계좌번호",
      accounts: c.brideGive,
      contactButtonLabel: "신부 측에 연락하기",
      contactModalTitle: "신부 측 연락처",
      contacts: brideContacts,
      label: "신부측",
      parentLabel: "신부",
      onContactClick: () => setShowBrideContactModal(true),
    },
    groom: {
      accountTitle: "신랑측 계좌번호",
      accounts: c.groomGive,
      contactButtonLabel: "신랑 측에 연락하기",
      contactModalTitle: "신랑 측 연락처",
      contacts: groomContacts,
      label: "신랑측",
      parentLabel: "신랑",
      onContactClick: () => setShowGroomContactModal(true),
    },
  };

  return (
    <>
      <InvitationHero
        content={c}
        isInvitationVersion={isInvitationVersion}
        primarySide={primarySide}
      />
      <Main>
      <FirstSectionHeader kicker="01 · Invitation" title="함께하는 새로운 시작" />
      {greetingParagraphs.map((p, i) => (
        <GreetingP key={i}>
          {p
            .split("\n")
            .map((l) => l.trim())
            .join("\n")}
        </GreetingP>
      ))}
      <ParentGrid>
        {orderedSides.map((side, index) => {
          const item = sideContent[side];
          const family = parseFamilyLine(getSideFamilyLine(c, side));

          return (
            <ParentCard key={side} $withBorder={index > 0}>
              <ParentSide>{item.parentLabel}</ParentSide>
              <div>{family.parents}</div>
              {family.role && <ParentRole>{family.role}</ParentRole>}
              {family.name && <ParentChildName>{family.name}</ParentChildName>}
            </ParentCard>
          );
        })}
      </ParentGrid>
      <CallWrap>
        {orderedSides.map((side) => {
          const item = sideContent[side];

          return (
            <ContactTrigger
              key={side}
              type="button"
              onClick={item.onContactClick}
            >
              <span>
                <Phone />
                {item.contactButtonLabel}
              </span>
              <ArrowRight />
            </ContactTrigger>
          );
        })}
      </CallWrap>
      {isInvitationVersion && (
        <DirectionsWrap>
          <SectionHeader kicker="03 · Directions" title="오시는 길" />
          <DirectionsContent>
            <VenueCard>
              <VenueName>{c.venue.desc}</VenueName>
              <VenueAddress>{c.venue.address}</VenueAddress>
              <MapButtonRow>
                <Btn
                  as="a"
                  href={c.venue.kakaoMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  $variant="tertiary"
                >
                  <Pin />
                  카카오맵
                </Btn>
                <Btn
                  as="a"
                  href={c.venue.naverMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  $variant="tertiary"
                >
                  <Pin />
                  네이버지도
                </Btn>
                <Btn type="button" $variant="tertiary" onClick={handleCopyAddress}>
                  <Copy />
                  주소 복사
                </Btn>
              </MapButtonRow>
            </VenueCard>

            <MapFrame>
              <SingleMap />
            </MapFrame>

            <TransportList>
              {transportSections.slice(0, 1).map((section) => (
                <TransportCard key={section.title}>
                  <TransportIcon>{section.icon}</TransportIcon>
                  <div>
                    <TransportTitle>{section.title}</TransportTitle>
                    <TransportText>{section.content}</TransportText>
                  </div>
                </TransportCard>
              ))}
              <ShuttleCard onOpen={() => setShowShuttleModal(true)} />
              {transportSections.slice(1).map((section) => (
                <TransportCard key={section.title}>
                  <TransportIcon>{section.icon}</TransportIcon>
                  <div>
                    <TransportTitle>{section.title}</TransportTitle>
                    <TransportText>{section.content}</TransportText>
                  </div>
                </TransportCard>
              ))}
            </TransportList>
          </DirectionsContent>
        </DirectionsWrap>
      )}
      <RsvpWrap>
        <SectionHeader
          kicker="04 · RSVP"
          title="참석 여부 전달"
          sub={`귀한 마음으로 모실 수 있도록 부담 없이 알려주시면 정성껏 준비하겠습니다.`}
        />
        <RsvpContent>
          {c.rsvpFormUrl && (
            <Btn
              as="a"
              href={c.rsvpFormUrl}
              target="_blank"
              rel="noreferrer"
              $variant="primary"
              $full
            >
              <ArrowRight />
              참석 의사 전달하기
            </Btn>
          )}
          <RsvpMeta>— by 06.13 —</RsvpMeta>
        </RsvpContent>
      </RsvpWrap>
      <SectionHr />
      <SectionHeader
        kicker="05 · Gratitude"
        title="마음 전하실 곳"
      />
      <GiveWrap>
        {orderedSides.map((side) => {
          const item = sideContent[side];

          return (
            <GiveGroup key={side}>
              <AccountReveal accounts={item.accounts} title={item.accountTitle} />
            </GiveGroup>
          );
        })}
      </GiveWrap>
      <SectionHr />
      <SectionHeader
        kicker="06 · Guestbook"
        title="축하의 한마디"
      />
      <WriteSectionSubHeader>
        {orderedSides.map((side) => (
          <p key={side}>{sideContent[side].label}</p>
        ))}
      </WriteSectionSubHeader>
      <div style={{ clear: "both" }} />
      <TalkWrap>
        <WriteButtonTrigger ref={writeButtonTriggerRef} />
        {talkListResp?.talks.map((talk) => (
          <TalkBubble
            key={talk.id}
            talk={talk}
            selected={talk.id === selectedTalkId}
            primarySide={primarySide}
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
          한마디 남기기
        </WriteButton>
      )}
      <ClosingSection>
        <ClosingOrnament>
          <span />
          <span />
          <span />
        </ClosingOrnament>
        <Monogram>
          <MonogramNames>
            <span>S</span>
            <MonogramDot />
            <span>M</span>
          </MonogramNames>
          <MonogramDate>
            <span />
            <Kicker>2026 · 06 · 27</Kicker>
            <span />
          </MonogramDate>
          <ClosingThanks>thank you</ClosingThanks>
        </Monogram>
      </ClosingSection>
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} />
        </Modal>
      )}
      {showBrideContactModal && (
        <Modal handleClose={() => setShowBrideContactModal(false)}>
          <ContactModal
            contacts={sideContent.bride.contacts}
            title={sideContent.bride.contactModalTitle}
            onClose={() => setShowBrideContactModal(false)}
          />
        </Modal>
      )}
      {showGroomContactModal && (
        <Modal handleClose={() => setShowGroomContactModal(false)}>
          <ContactModal
            contacts={sideContent.groom.contacts}
            title={sideContent.groom.contactModalTitle}
            onClose={() => setShowGroomContactModal(false)}
          />
        </Modal>
      )}
      {showShuttleModal && (
        <Modal handleClose={() => setShowShuttleModal(false)}>
          <ShuttleModal onClose={() => setShowShuttleModal(false)} />
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
