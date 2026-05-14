export type Content = ContentSpec & {
  photos: { url: string; objectPosition?: string }[];
};

export type ContentSpec = {
  // meta
  htmlTitle: string;
  htmlDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogImageUrl: string;

  // card
  groomFullName: string;
  brideFullName: string;
  datetime: string;
  venue: {
    desc: string;
    address: string;
    kakaoMapUrl: string;
    naverMapUrl: string;
  };
  link?: { label: string; url: string };
  rsvpFormUrl?: string;
  calendarEvent: {
    title: string;
    start: string;
    end: string;
    timeZone: string;
    location: string;
    details: string;
  };
  greeting: { title: string; content: string[] };
  groomContact: string;
  brideContact: string;
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/object-position */
  galleryThumbPosition: { [filename: string]: string };
  groomGive: { name: string; account: string }[];
  brideGive: { name: string; account: string }[];
};

const myContentSpec: ContentSpec = {
  htmlTitle: "임석의 ♡ 김민지",
  htmlDesc: "임석의 ♡ 김민지 2026년 6월 27일에 결혼합니다.",
  ogTitle: "임석의 ♡ 김민지 청첩장",
  ogDesc: "2026년 6월 27일에 결혼합니다.",
  ogImageUrl:
    "https://google.com", // TODO: replace with actual image

  groomFullName: "임석의",
  brideFullName: "김민지",
  datetime: "2026년 6월 27일 토요일 오후 1시",
  venue: {
    desc: "시재 바이 마리아정",
    address: "경기 용인시 처인구 양지읍 주북로235번길 78, 78-1",
    kakaoMapUrl:
      "https://map.kakao.com/link/search/%EC%8B%9C%EC%9E%AC%20%EB%B0%94%EC%9D%B4%20%EB%A7%88%EB%A6%AC%EC%95%84%EC%A0%95%20%EA%B2%BD%EA%B8%B0%20%EC%9A%A9%EC%9D%B8%EC%8B%9C%20%EC%B2%98%EC%9D%B8%EA%B5%AC%20%EC%96%91%EC%A7%80%EC%9D%8D%20%EC%A3%BC%EB%B6%81%EB%A1%9C235%EB%B2%88%EA%B8%B8%2078%2C%2078-1",
    naverMapUrl:
      "https://map.naver.com/p/search/%EC%8B%9C%EC%9E%AC%20%EB%B0%94%EC%9D%B4%20%EB%A7%88%EB%A6%AC%EC%95%84%EC%A0%95%20%EA%B2%BD%EA%B8%B0%20%EC%9A%A9%EC%9D%B8%EC%8B%9C%20%EC%B2%98%EC%9D%B8%EA%B5%AC%20%EC%96%91%EC%A7%80%EC%9D%8D%20%EC%A3%BC%EB%B6%81%EB%A1%9C235%EB%B2%88%EA%B8%B8%2078%2C%2078-1",
  },
  link: { label: "📹 결혼식 생중계 보러가기", url: "/live" },
  rsvpFormUrl: "",
  calendarEvent: {
    title: "임석의 ♡ 김민지 결혼식",
    start: "20260627T130000",
    end: "20260627T150000",
    timeZone: "Asia/Seoul",
    location:
      "시재 바이 마리아정, 경기 용인시 처인구 양지읍 주북로235번길 78, 78-1",
    details: "임석의 ♡ 김민지 결혼식",
  },
  greeting: {
    title: "결혼합니다.",
    content: [
      `청명한 가을날
        새로이 시작하는 작은 사랑이
        보다 크고 깊은 사랑이 되려고 합니다.
        함께 자리하시어 축복해 주시면
        더없는 기쁨이겠습니다.`,
      `김대래 · 정혜욱의 삼녀 민지
        임영희 · 최은희의 차남 석의`,
    ],
  },
  groomContact: "tel:01071056849",
  brideContact: "tel:01073692869",
  galleryThumbPosition: {}, // e.g. { "p03.jpeg": "bottom" },
  groomGive: [{ name: "임석의", account: "카카오뱅크 3333-07-0052253" }],
  brideGive: [{ name: "김민지", account: "우리은행 1002-291-920831" }],
};

export default myContentSpec;
