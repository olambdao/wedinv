import { Copy, EmojiLookLeft, EmojiLookRight, Pin } from "iconoir-react";
import React, {
  Fragment,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import styled, { css, keyframes } from "styled-components";
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

const Header = styled.h1`
  display: inline-block;
  margin: 40px 0;

  font-size: 20px;
  font-weight: 500;
  line-height: 2.5;

  hr {
    width: 70%;
    margin: 0 auto;
    border: 0;
    border-top: 1px solid #ccc;
  }
`;

const skeletonLoading = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
`;

const SkeletonStyle = css`
  background: linear-gradient(90deg, #eeeeee 25%, #f8f8f8 37%, #eeeeee 63%);
  background-size: 400% 100%;
  animation: ${skeletonLoading} 1.4s ease infinite;
`;

const CoverPicWrap = styled.div`
  position: relative;
  width: calc(100% - 40px);
  aspect-ratio: 3 / 4;
  margin: 0 auto;
  margin-bottom: 40px;
  border-radius: 30px;
  overflow: hidden;
  line-height: 0;
  ${SkeletonStyle}
`;

const ActionWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin: 12px 10px;
`;

const LiveButton = styled.a`
  display: inline-block;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.5;
  background: rgba(255, 136, 170);

  animation: color-change 1s infinite;

  @keyframes color-change {
    0% {
      background: rgba(255, 136, 170, 0.7);
    }
    50% {
      background: rgb(255, 136, 170);
    }
    100% {
      background: rgba(255, 136, 170, 0.7);
    }
  }
`;

const ActionButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5;
  background: #f3f3f3;
`;

const GreetingP = styled.p`
  white-space: pre;
  margin: 30px 0;
`;

const CallWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 40px 0;
  > * {
    margin: 0 15px;
  }
`;

const CallButtonWrap = styled.div<{ bgColor: string }>`
  ${TextSansStyle}
  font-size: 13px;

  svg {
    display: block;
    margin: 0 auto;
    margin-bottom: 4px;
    width: 60px;
    height: 60px;
    color: white;
    padding: 15px;
    border-radius: 30px;
    background-color: ${({ bgColor }) => bgColor};
  }
`;

type CallButtonProps = {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
};

const CallButton = ({ icon, bgColor, label }: CallButtonProps) => (
  <>
    <CallButtonWrap bgColor={bgColor}>
      {icon}
      {label}
    </CallButtonWrap>
  </>
);

const PhotoGrid = styled.ul`
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px;

  li {
    height: 200px;
    flex-basis: 120px;
    flex-grow: 1;
    margin: 4px;
  }

  div {
    width: 100%;
    height: 100%;
    ${SkeletonStyle}
  }
`;

const MapSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  ${SkeletonStyle}
`;

const MapButton = styled.a`
  ${TextSansStyle}
  display: inline-block;
  padding: 8px 16px 8px 10px;
  border: 0;
  border-radius: 18px;
  margin: 0 10px;
  color: #666;
  font-size: 13px;
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

const GiveWrap = styled.div`
  display: inline-block;
  text-align: left;
  line-height: 2;
`;

const CopyTextButton = styled.button`
  padding: 0;
  border: none;
  background: none;

  svg {
    width: 20px;
    height: 20px;
    padding: 2px;
    color: #999;
    vertical-align: sub;
  }
`;
const CopyText = ({ text }: { text: string }) => {
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
    <>
      {text}
      <CopyTextButton onClick={handleCopyText} aria-label="복사">
        <Copy />
      </CopyTextButton>
    </>
  );
};

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

const WriteButton = styled.button<{ visible: boolean }>`
  ${TextSansStyle}
  ${({ visible }) =>
    visible
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
        font-size: 11px;
      }
    }
    .edit {
      font-size: 0.9em;
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

const getGoogleCalendarUrl = (event: Content["calendarEvent"]) => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.start}/${event.end}`,
    ctz: event.timeZone,
    location: event.location,
    details: event.details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

type HomeProps = { content: Content; variant: InvitationVariant };

const Home = ({ content: c, variant }: HomeProps) => {
  const [writeDone, setWriteDone] = useSessionStorage("talk.writedone");
  const { data: talkListResp, mutate } =
    useSWR<GetTalkListResponse>("/api/talk/list");

  const [showWriteTalkModal, setShowWriteTalkModal] = useState(false);
  const [showEditTalkModal, setShowEditTalkModal] = useState<Talk>();
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
  const [firstName, secondName] =
    variant === "bride"
      ? [c.brideFullName, c.groomFullName]
      : [c.groomFullName, c.brideFullName];
  const isInvitationVersion = variant !== "nomap";
  const calendarUrl = getGoogleCalendarUrl(c.calendarEvent);

  return (
    <Main>
      <Header>
        {firstName}
        <hr />
        {secondName}
      </Header>
      <CoverPicWrap aria-label="사진 준비중" />
      <p>
        {c.datetime}
        <br />
        {c.venue.desc}
      </p>
      <ActionWrap>
        {c.link && (
          <LiveButton href={c.link.url}>{c.link.label}</LiveButton>
        )}
        {isInvitationVersion && c.rsvpFormUrl && (
          <ActionButton href={c.rsvpFormUrl} target="_blank" rel="noreferrer">
            RSVP
          </ActionButton>
        )}
        {isInvitationVersion && (
          <ActionButton href={calendarUrl} target="_blank" rel="noreferrer">
            구글 캘린더
          </ActionButton>
        )}
      </ActionWrap>

      <SectionHr />

      <SectionHeader>{c.greeting.title}</SectionHeader>
      {c.greeting.content.map((p, i) => (
        <GreetingP key={i}>
          {p
            .split("\n")
            .map((l) => l.trim())
            .join("\n")}
        </GreetingP>
      ))}
      <CallWrap>
        <a href={c.groomContact}>
          <CallButton
            icon={<EmojiLookRight />}
            bgColor="#abdaab"
            label="신랑측에 연락하기"
          />
        </a>
        <a href={c.brideContact}>
          <CallButton
            icon={<EmojiLookLeft />}
            bgColor="#c2e0a3"
            label="신부측에 연락하기"
          />
        </a>
      </CallWrap>
      <SectionHr />
      <PhotoGrid>
        {c.photos.map((_, i) => (
          <li key={i}>
            <div aria-label="사진 준비중" />
          </li>
        ))}
      </PhotoGrid>
      {isInvitationVersion && (
        <>
          <SectionHr />
          <SectionHeader>오시는 길</SectionHeader>
          <MapSkeleton aria-label="지도 이미지 준비중" />
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
        </>
      )}
      <SectionHr />
      <SectionHeader>💸 마음 전하실 곳</SectionHeader>
      <GiveWrap>
        <p>
          <strong>신랑측</strong>
          <br />
          {c.groomGive.map((g) => (
            <Fragment key={g.account}>
              {g.name} <CopyText text={g.account} />
              <br />
            </Fragment>
          ))}
        </p>
        <p>
          <strong>신부측</strong>
          <br />
          {c.brideGive.map((g) => (
            <Fragment key={g.account}>
              {g.name} <CopyText text={g.account} />
              <br />
            </Fragment>
          ))}
        </p>
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
          visible={isWriteButtonShown}
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
      {showEditTalkModal && (
        <Modal handleClose={handleEditTalkModalClose}>
          <EditTalk talk={showEditTalkModal} onEdit={handleEditTalk} />
        </Modal>
      )}
    </Main>
  );
};

export default Home;
