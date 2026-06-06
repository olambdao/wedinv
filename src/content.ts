export type Content = ContentSpec & {
  photos?: { url: string; objectPosition?: string }[];
};

export type FamilyInfo = {
  parents: string;
  relation: string;
  name: string;
};

export type ContentSpec = {
  // meta
  groomHtmlTitle: string;
  brideHtmlTitle: string;
  groomHtmlDesc: string;
  brideHtmlDesc: string;
  groomOgTitle: string;
  brideOgTitle: string;
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
  shuttle: {
    departTime: string;
    departPlace: string;
    returnTimes: string[];
    notes: string[];
    contactName: string;
    contactPhone: string;
  };
  rsvpFormUrl?: string;
  calendarEvent: {
    title: string;
    start: string;
    end: string;
    timeZone: string;
    location: string;
    details: string;
  };
  greeting: {
    title: string;
    content: string[];
    groomFamily: FamilyInfo;
    brideFamily: FamilyInfo;
  };
  groomContact: string;
  brideContact: string;
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/object-position */
  galleryThumbPosition: { [filename: string]: string };
  groomGive: { name: string; account: string }[];
  brideGive: { name: string; account: string }[];
};

const myContentSpec: ContentSpec = {
  groomHtmlTitle: "임석의 · 김민지",
  brideHtmlTitle: "김민지 · 임석의",
  groomHtmlDesc: "임석의 · 김민지 2026년 6월 27일에 결혼합니다.",
  brideHtmlDesc: "김민지 · 임석의 2026년 6월 27일에 결혼합니다.",
  groomOgTitle: "임석의 · 김민지 청첩장",
  brideOgTitle: "김민지 · 임석의 청첩장",
  ogDesc: "2026년 6월 27일에 결혼합니다.",
  ogImageUrl: "https://pub-541f6889b5904f0f90489aaa3c4c69fa.r2.dev/og.jpg", 

  groomFullName: "임석의",
  brideFullName: "김민지",
  datetime: "2026년 6월 27일 토요일 오후 1시",
  venue: {
    desc: "시재 바이 마리아정",
    address: "경기 용인시 처인구 양지읍 주북로235번길 78, 78-1",
    kakaoMapUrl: "https://kko.to/Ru3Hv8h9Xs",
    naverMapUrl: "https://naver.me/GgWECISM",
  },
  shuttle: {
    departTime: "2026. 06. 27 (토) 오전 11:15",
    departPlace: "서울 교대역 14번 출구 앞",
    returnTimes: [
      "14:30 출발\n→ 에버라인선 용인중앙시장역 행",
      "16:00 출발\n→ 2•3호선 교대역 행",
    ],
    notes: [
      "출발 10분 전 도착 부탁드립니다.",
      "귀가 차량은 2회 운영됩니다.",
    ],
    contactName: "신랑측 박성혁",
    contactPhone: "010-4800-3045",
  },
  rsvpFormUrl: "https://forms.gle/zv89MsVR3hZoLN1VA",
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
      `서로 다른 시간 끝에 만나
        이제는 한 마음으로
        같은 생을 그려가려 합니다.`,
    ],
    groomFamily: {
      parents: "임영희 · 최은희",
      relation: "의 아들",
      name: "석의",
    },
    brideFamily: {
      parents: "김대래 · 정혜욱",
      relation: "의 딸",
      name: "민지",
    },
  },
  groomContact: "tel:01071056849",
  brideContact: "tel:01073692869",
  galleryThumbPosition: {
    "p01.jpg": "center",
    "p02.jpg": "center",
    "p03.jpg": "center",
    "p04.jpg": "center",
    "p05.jpg": "center",
    "p06.jpg": "center",
    "p07.jpg": "center",
    "p08.jpg": "center",
    "p09.jpg": "center",
  }, // e.g. { "p03.jpeg": "bottom" },
  groomGive: [
    { name: "임석의", account: "카카오뱅크 3333-28-6775167" },
    { name: "임영희", account: "하나은행 534-910057-49207" },
    { name: "최은희", account: "하나은행 407-910679-71307" },
  ],
  brideGive: [
    { name: "김민지", account: "카카오뱅크 3333-01-9202440" },
    { name: "김대래", account: "농협 924-1223-1741" },
    { name: "정혜욱", account: "부산은행 078-01-0224428" },
  ],
};

export default myContentSpec;
