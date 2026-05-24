import {
  ArrowRight,
  Bus,
  Calendar,
  Car,
  Copy,
  MessageText,
  Phone,
  Pin,
  Train,
} from "iconoir-react";
import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import QuickPinchZoom, {
  make3dTransformValue,
  type UpdateAction,
} from "react-quick-pinch-zoom";
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
  Btn,
  FM,
  Kicker,
  Main,
  SectionHeader,
  SectionHr,
  T,
  TextSansStyle,
  TextSerifStyle,
} from "./styles";
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
  object-fit: cover;
  object-position: center 46%;
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

const getSideFamily = (content: Content, side: InvitationSide) =>
  side === "groom" ? content.greeting.groomFamily : content.greeting.brideFamily;

const getPartyInvitationSide = (party: Party): InvitationSide =>
  party === "GROOM" ? "groom" : "bride";

const getPartyAlignment = (
  party: Party,
  primarySide: InvitationSide
): BubbleAlignment =>
  getPartyInvitationSide(party) === primarySide ? "left" : "right";

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

const RSVP_DEADLINE = {
  label: "06.13",
  value: "2026-06-13T00:00:00+09:00",
};

type DirectionImageInfo = {
  src: string;
  alt: string;
};

const directionImages: DirectionImageInfo[] = [
  { src: "/directions1.jpeg", alt: "오시는 길 안내 1" },
  { src: "/directions2.jpeg", alt: "오시는 길 안내 2" },
];

const getKoreaDateStart = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(date).split("-");

  return new Date(`${year}-${month}-${day}T00:00:00+09:00`);
};

const getRsvpMetaText = (now = new Date()) => {
  const today = getKoreaDateStart(now);
  const deadline = new Date(RSVP_DEADLINE.value);
  const dday = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const ddayText =
    dday > 0 ? `D-${dday}` : dday === 0 ? "D-DAY" : `D+${Math.abs(dday)}`;

  return `— by ${RSVP_DEADLINE.label} · ${ddayText} —`;
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
  const shouldShowHeroActions = isInvitationVersion && primarySide !== "groom";

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
          {/* {getEventTimeText(c.datetime)} */}
          {c.datetime}
          <br />
          {c.venue.desc}
        </HeroEventDetail>
        {shouldShowHeroActions && (
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
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  line-height: 1.9;
  text-align: center;
`;

const ParentSide = styled(Kicker)`
  margin-bottom: 6px;
  color: ${T.inkMuted};
`;

const ParentNames = styled.div`
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 17px;
  white-space: nowrap;
  letter-spacing: 0.04em;
  line-height: 1.9;
`;

const ParentRole = styled.div`
  color: ${T.inkMuted};
  font-size: 13px;
  line-height: 1.9;
`;

const ParentChildName = styled.div`
  margin-top: 4px;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  line-height: 1.9;
`;

const ContactModalCard = styled.div`
  width: 100%;
  max-height: calc(100svh - 40px);
  overflow: auto;
  border: 1px solid ${T.rule};
  border-radius: 10px;
  background: ${T.bg};
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
`;

const ContactModalHeader = styled.div`
  padding: 24px 24px 0;
  text-align: center;
`;

const ContactModalTitle = styled.h3`
  ${TextSerifStyle}
  margin: 8px 0 0;
  color: ${T.ink};
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.4;
`;

const ContactList = styled.div`
  ${TextSansStyle}
  overflow: hidden;
  border: 1px solid ${T.rule};
  border-radius: 6px;
  background: ${T.paper};
  text-align: left;
`;

const ContactRow = styled.div`
  padding: 14px 16px;
  border-top: 1px solid ${T.rule};

  &:first-child {
    border-top: 0;
  }
`;

const ContactRowHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
`;

const ContactLabel = styled(Kicker)`
  color: ${T.inkMuted};
`;

const ContactName = styled.div`
  ${TextSerifStyle}
  color: ${T.ink};
  font-size: 14.5px;
  letter-spacing: 0.04em;
  line-height: 1.4;
`;

const ContactPhone = styled.div`
  margin-left: auto;
  color: ${T.inkSoft};
  font-family: ${FM};
  font-size: 11px;
  letter-spacing: 0.02em;
  line-height: 1.4;
`;

const ContactActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;

  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border: 1px solid ${T.rule};
    border-radius: 4px;
    color: ${T.ink};
    background: ${T.bg};
    font-size: 12.5px;
    letter-spacing: 0.04em;
    line-height: 1.4;
    text-decoration: none;

    &&,
    &&:link,
    &&:visited,
    &&:hover {
      color: ${T.ink};
      text-decoration: none;
    }
  }

  svg {
    width: 14px;
    height: 14px;
    color: ${T.accent};
  }
`;

const ContactModalBody = styled.div`
  padding: 20px 24px 8px;
`;

const ContactModalFooter = styled.div`
  padding: 12px 24px 24px;
`;

const brideContacts = [
  { label: "신부", name: "김민지", phone: "010-3934-5499" },
  { label: "아버님", name: "김대래", phone: "010-3156-5286" },
  { label: "어머님", name: "정혜욱", phone: "010-8436-5286" },
];

const groomContacts = [
  { label: "신랑", name: "임석의", phone: "010-4721-0265" },
  { label: "아버님", name: "임영희", phone: "010-3592-9109" },
  { label: "어머님", name: "최은희", phone: "010-3666-9109" },
];

type ContactItem = (typeof brideContacts)[number];

const ContactPanel = ({ contacts }: { contacts: ContactItem[] }) => (
  <ContactList>
    {contacts.map((contact) => {
      const phoneNumber = contact.phone.replaceAll("-", "");

      return (
        <ContactRow key={contact.phone}>
          <ContactRowHeader>
            <ContactLabel>{contact.label}</ContactLabel>
            <ContactName>{contact.name}</ContactName>
            <ContactPhone>{contact.phone}</ContactPhone>
          </ContactRowHeader>
          <ContactActions>
            <a href={`tel:${phoneNumber}`} aria-label={`${contact.label} 전화걸기`}>
              <Phone />
              전화 걸기
            </a>
            <a
              href={`sms:${phoneNumber}`}
              aria-label={`${contact.label} 메시지 보내기`}
            >
              <MessageText />
              메시지 보내기
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
    <ContactModalHeader>
      <Kicker>Contact · 마음 전하는 말</Kicker>
      <ContactModalTitle>{title}</ContactModalTitle>
    </ContactModalHeader>
    <ContactModalBody>
      <ContactPanel contacts={contacts} />
    </ContactModalBody>
    <ContactModalFooter>
      <Btn type="button" $variant="secondary" $full onClick={onClose}>
        닫기
      </Btn>
    </ContactModalFooter>
  </ContactModalCard>
);

const GalleryWrap = styled.section`
  padding-top: 72px;
`;

const GalleryContent = styled.div`
  padding: 0 24px;
`;

const GalleryPhoto = styled.img<{ $objectPosition?: string }>`
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  border: 1px solid ${T.rule};
  object-fit: cover;
  object-position: ${({ $objectPosition }) => $objectPosition ?? "center"};
`;

const GalleryCount = styled.div`
  margin-top: 14px;
  color: ${T.inkMuted};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.16em;
  line-height: 1.5;
  text-align: center;
  text-transform: uppercase;
`;

const DirectionsWrap = styled.section`
  padding-top: 72px;
`;

const DirectionsContent = styled.div`
  padding: 0 24px;
`;

const VenueBlock = styled.div`
  margin-bottom: 20px;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DirectionImageButton = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
`;

const DirectionImage = styled.img`
  display: block;
  width: 100%;
  border: 1px solid ${T.rule};
  border-radius: 4px;
`;

const MapZoomOverlay = styled.div`
  position: fixed;
  z-index: 120;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 17, 13, 0.72);
`;

const MapZoomDialog = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 920px;
  height: 100svh;
  overflow: hidden;

  @media (max-width: 920px) {
    max-width: none;
  }
`;

const MapZoomHeader = styled.div`
  display: contents;
`;

const MapZoomTitle = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
`;

const MapZoomCloseButton = styled.button`
  ${TextSansStyle}
  position: absolute;
  z-index: 1;
  top: 12px;
  right: 12px;
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  color: ${T.paper};
  background: rgba(20, 17, 13, 0.72);
  font-size: 12px;
  line-height: 1.4;
`;

const MapZoomViewport = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;

  > div {
    width: 100%;
    height: 100%;
  }
`;

const ZoomableDirectionImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: 0 0;
  user-select: none;
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
  font-size: 14px;
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
  font-size: 13px;
  line-height: 1.6;
`;

const ShuttleModalCard = styled.div`
  width: 100%;
  max-height: calc(100svh - 40px);
  overflow: auto;
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

const ShuttleNotesSection = styled.div`
  margin-top: 14px;
`;

const ShuttleNotesList = styled.ul`
  ${TextSansStyle}
  margin: 0;
  padding-left: 18px;
  color: ${T.inkSoft};
  font-size: 13px;
  line-height: 1.7;
  list-style: disc outside;

  li {
    display: list-item;
    margin: 2px 0;
  }

  li::marker {
    color: ${T.accent};
    font-size: 0.8em;
  }
`;

const DetailRowWrap = styled.div<{ $last?: boolean }>`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 8px;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: ${({ $last }) => ($last ? 0 : `1px solid ${T.rule}`)};
`;

const DetailLabel = styled.div`
  color: ${T.accent};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  text-transform: uppercase;
`;

const ShuttleNotesTitle = styled(DetailLabel)`
  margin-bottom: 8px;
`;

const DetailValue = styled.div`
  ${TextSansStyle}
  color: ${T.ink};
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-line;
`;

const ReturnTimes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px;
`;

const RsvpMeta = styled.p`
  margin: 4px 0 0;
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
  border: 1px solid ${T.rule};
  border-radius: 4px;
  color: ${T.accent};
  background: ${T.bg};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    color: currentColor;
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
  grid-template-columns: minmax(0, 1fr) 36px;
  gap: 10px;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid ${T.rule};

  &:first-child {
    border-top: 0;
  }
`;

const AccountInfo = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
`;

const AccountName = styled.span`
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  white-space: nowrap;
`;

const AccountNumber = styled.span`
  color: ${T.inkSoft};
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  line-height: 1.5;
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
    <CopyTextButton
      type="button"
      onClick={handleCopyText}
      aria-label="계좌 복사"
    >
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
          <AccountInfo>
            <AccountName>{account.name}</AccountName>
            <AccountNumber>{account.account}</AccountNumber>
          </AccountInfo>
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
        <span>{title.replace(" 계좌번호", "")} 계좌 안내</span>
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
    content: "영동고속 양지 IC 또는 용인 IC에서 약 10분\n예식장 내 무료 주차 가능합니다",
    icon: <Car />,
  },
  {
    title: "대중교통",
    content: "용인공용버스터미널 하차 → 택시로 약 15분",
    icon: <Train />,
  },
];

type ShuttleInfo = Content["shuttle"];

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

const ShuttleCard = ({
  onOpen,
  shuttle,
}: {
  onOpen: () => void;
  shuttle: ShuttleInfo;
}) => (
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
      <ShuttleHint>참석 의사 전달시 탑승 여부를 함께 전달해 주세요.</ShuttleHint>
    </div>
  </TransportCard>
);

const ShuttleModal = ({
  onClose,
  shuttle,
}: {
  onClose: () => void;
  shuttle: ShuttleInfo;
}) => (
  <ShuttleModalCard>
    <ShuttleModalHeader>
      <ShuttleModalTitle>전세버스 안내</ShuttleModalTitle>
      <ShuttleModalSub>
        참석 의사 전달시 탑승 여부를 함께 전달해 주세요.
      </ShuttleModalSub>
    </ShuttleModalHeader>
    <ShuttleModalBody>
      <ShuttleDetailBox>
        <DetailRow label="출발일시">{shuttle.departTime}</DetailRow>
        <DetailRow label="탑승장소">{shuttle.departPlace}</DetailRow>
        <DetailRow label="복귀시각">
          <ReturnTimes>
            {shuttle.returnTimes.map((returnTime) => (
              <div key={returnTime}>{returnTime}</div>
            ))}
          </ReturnTimes>
        </DetailRow>
        <DetailRow label="탑승문의" last>
          {shuttle.contactName}
          <div>
            <ShuttlePhoneLink
              href={`tel:${shuttle.contactPhone.replaceAll("-", "")}`}
            >
              <Phone />
              {shuttle.contactPhone}
            </ShuttlePhoneLink>
          </div>
        </DetailRow>
      </ShuttleDetailBox>
      {shuttle.notes.length > 0 && (
        <ShuttleNotesSection>
          <ShuttleNotesTitle>추가 안내</ShuttleNotesTitle>
          <ShuttleNotesList>
            {shuttle.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ShuttleNotesList>
        </ShuttleNotesSection>
      )}
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
          bottom: calc(18px + env(safe-area-inset-bottom));
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
  border-radius: 9999px;

  color: ${T.ink};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: rgba(251, 248, 241, 0.96);
  box-shadow: 0 10px 24px rgba(42, 38, 32, 0.1),
    0 2px 8px rgba(42, 38, 32, 0.06);

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

const TalkAvatar = styled.div<{ $color: string }>`
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(42, 38, 32, 0.06);
`;

const TalkBubbleWrap = styled.div<{
  $selected: boolean;
  $alignment: BubbleAlignment;
}>`
  ${TextSansStyle}
  display: flex;
  flex-direction: ${({ $alignment }) =>
    $alignment === "right" ? "row-reverse" : "row"};
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  > div {
    max-width: 78%;
    min-width: 0;
    text-align: ${({ $alignment }) =>
      $alignment === "right" ? "right" : "left"};
    line-height: 1.55;

    .talk-meta {
      margin-bottom: 4px;
      color: ${T.inkMuted};
      font-size: 11.5px;
      letter-spacing: 0.04em;
      line-height: 1.45;
    }

    div.bubble-info-wrap {
      p {
        display: inline-block;
        max-width: 100%;
        margin: 0;
        padding: 10px 14px;
        border: 1px solid ${T.rule};
        ${({ $alignment }) =>
          $alignment === "right"
            ? css`
                border-radius: 12px 4px 12px 12px;
              `
            : css`
                border-radius: 4px 12px 12px 12px;
              `}
        color: ${T.ink};
        background: ${T.paper};
        font-size: 13.5px;
        line-height: 1.55;
        text-align: left;
        white-space: pre-wrap;
        word-break: break-all;
        overflow-wrap: break-word;

        ${({ $selected }) =>
          $selected &&
          css`
            border-color: rgba(95, 102, 84, 0.34);
            background: ${T.bgSoft};
          `}
      }
    }

    .edit {
      color: ${T.accent};
      font-size: 11.5px;
      text-decoration: underline;
      text-underline-offset: 2px;
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
      $selected={selected}
      $alignment={alignment}
    >
      <TalkAvatar $color={talk.color} />
      <div onClick={handleBubbleOutsideClick}>
        <div className="talk-meta">
          {selected && alignment === "right" && <>{editBtn} · </>}
          {talk.author} ·{" "}
          {!talk.published
            ? "검수중"
            : timeDiffFormat(new Date(talk.created))}
          {selected && alignment === "left" && <> · {editBtn}</>}
        </div>
        <div className="bubble-info-wrap">
          <p onClick={handleBubbleClick}>{talk.msg}</p>
        </div>
      </div>
    </TalkBubbleWrap>
  );
};

const DirectionImageZoomModal = ({
  image,
  onClose,
}: {
  image: DirectionImageInfo;
  onClose: () => void;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);

  const handleUpdate = useCallback(({ x, y, scale }: UpdateAction) => {
    imageRef.current?.style.setProperty(
      "transform",
      make3dTransformValue({ x, y, scale })
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <MapZoomOverlay
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
    >
      <MapZoomDialog onClick={(event) => event.stopPropagation()}>
        <MapZoomHeader>
          <MapZoomTitle>{image.alt}</MapZoomTitle>
          <MapZoomCloseButton type="button" onClick={onClose}>
            닫기
          </MapZoomCloseButton>
        </MapZoomHeader>
        <MapZoomViewport>
          <QuickPinchZoom
            key={image.src}
            onUpdate={handleUpdate}
            maxZoom={4}
            wheelScaleFactor={500}
            draggableUnZoomed
            shouldInterceptWheel={() => true}
          >
            <ZoomableDirectionImage
              ref={imageRef}
              src={image.src}
              alt={image.alt}
              draggable={false}
            />
          </QuickPinchZoom>
        </MapZoomViewport>
      </MapZoomDialog>
    </MapZoomOverlay>
  );
};

const ThankYou = styled.div`
  padding: 60px;
  color: #666;
`;

const ClosingSection = styled.section`
  padding: 88px 0 calc(112px + env(safe-area-inset-bottom));
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${T.ink};
  font-family: "Noto Serif KR", "Nanum Myeongjo", serif;
  font-size: 46px;
  font-weight: 400;
  line-height: 1.2;

  span {
    display: inline-flex;
    justify-content: center;
    width: 44px;
    letter-spacing: 0.08em;
    text-indent: 0.08em;
  }
`;

const MonogramDot = styled.span`
  display: inline-block;
  flex: 0 0 6px;
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
  const [selectedDirectionImage, setSelectedDirectionImage] =
    useState<DirectionImageInfo>();
  const [rsvpMetaText, setRsvpMetaText] = useState(
    `— by ${RSVP_DEADLINE.label} —`
  );

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

  useEffect(() => {
    setRsvpMetaText(getRsvpMetaText());
  }, []);

  const handleTalkBubbleClick = (id: string | undefined) =>
    setSelectedTalkId(id);
  const handleDirectionImageZoomClose = useCallback(
    () => setSelectedDirectionImage(undefined),
    []
  );

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
  const calendarUrl = getCalendarUrl(c);
  const shouldShowRsvpCalendar = isInvitationVersion && primarySide === "groom";
  const orderedSides = getOrderedInvitationSides(primarySide);
  const greetingParagraphs = c.greeting.content;
  const galleryPhoto = c.photos?.[0];
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
          const family = getSideFamily(c, side);

          return (
            <ParentCard key={side} $withBorder={index > 0}>
              <ParentSide>{item.parentLabel}</ParentSide>
              <ParentNames>{family.parents}</ParentNames>
              {family.relation && <ParentRole>{family.relation}</ParentRole>}
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
      {galleryPhoto && (
        <GalleryWrap>
          <SectionHeader
            kicker="02 · Gallery"
            title="우리, 함께한 시간"
          />
          <GalleryContent>
            <GalleryPhoto
              src={galleryPhoto.url}
              alt="웨딩 사진"
              $objectPosition={galleryPhoto.objectPosition}
            />
            {/* <GalleryCount>— 1 photo —</GalleryCount> */}
          </GalleryContent>
        </GalleryWrap>
      )}
      {isInvitationVersion && (
        <DirectionsWrap>
          <SectionHeader kicker="03 · Directions" title="오시는 길" />
          <DirectionsContent>
            <VenueBlock>
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
                  복사
                </Btn>
              </MapButtonRow>
            </VenueBlock>

            <MapFrame>
              {directionImages.map((image, index) => (
                <DirectionImageButton
                  key={image.src}
                  type="button"
                  aria-label={`오시는 길 안내 ${index + 1} 확대`}
                  onClick={() => setSelectedDirectionImage(image)}
                >
                  <DirectionImage src={image.src} alt={image.alt} />
                </DirectionImageButton>
              ))}
            </MapFrame>

            <TransportList>
              {transportSections.slice(0, 1).map((section) => (
                <TransportCard key={section.title}>
                  <TransportIcon>{section.icon}</TransportIcon>
                  <div>
                    <TransportTitleRow>
                      <TransportTitle>{section.title}</TransportTitle>
                    </TransportTitleRow>
                    <TransportText>{section.content}</TransportText>
                  </div>
                </TransportCard>
              ))}
              <ShuttleCard
                shuttle={c.shuttle}
                onOpen={() => setShowShuttleModal(true)}
              />
              {transportSections.slice(1).map((section) => (
                <TransportCard key={section.title}>
                  <TransportIcon>{section.icon}</TransportIcon>
                  <div>
                  <TransportTitleRow>
                    <TransportTitle>{section.title}</TransportTitle>
                    </TransportTitleRow>
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
          sub={`귀한 마음으로 모실 수 있도록 부담 없이 알려주시면\n정성껏 준비하겠습니다.`}
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
          {shouldShowRsvpCalendar && (
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
          )}
          <RsvpMeta>{rsvpMetaText}</RsvpMeta>
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
        {/* <ClosingOrnament>
          <span />
          <span />
          <span />
        </ClosingOrnament> */}
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
      {selectedDirectionImage && (
        <DirectionImageZoomModal
          image={selectedDirectionImage}
          onClose={handleDirectionImageZoomClose}
        />
      )}
      {showWriteTalkModal && (
        <Modal handleClose={handleWriteTalkModalClose}>
          <WriteTalk onWrite={handleWriteTalk} primarySide={primarySide} />
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
          <ShuttleModal
            shuttle={c.shuttle}
            onClose={() => setShowShuttleModal(false)}
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
