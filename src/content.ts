export type Content = ContentSpec & {
  photos?: { url: string; objectPosition?: string }[];
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
    groomFamily: string;
    brideFamily: string;
  };
  groomContact: string;
  brideContact: string;
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/object-position */
  galleryThumbPosition: { [filename: string]: string };
  groomGive: { name: string; account: string }[];
  brideGive: { name: string; account: string }[];
};

const myContentSpec: ContentSpec = {
  groomHtmlTitle: "임석의 ♡ 김민지",
  brideHtmlTitle: "김민지 ♡ 임석의",
  groomHtmlDesc: "임석의 ♡ 김민지 2026년 6월 27일에 결혼합니다.",
  brideHtmlDesc: "김민지 ♡ 임석의 2026년 6월 27일에 결혼합니다.",
  groomOgTitle: "임석의 ♡ 김민지 청첩장",
  brideOgTitle: "김민지 ♡ 임석의 청첩장",
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
    groomFamily: "임영희 · 최은희의 아들 석의",
    brideFamily: "김대래 · 정혜욱의 딸 민지",
  },
  groomContact: "tel:01071056849",
  brideContact: "tel:01073692869",
  galleryThumbPosition: {}, // e.g. { "p03.jpeg": "bottom" },
  groomGive: [
    { name: "임석의", account: "카카오뱅크 3333-28-6775167" },
    { name: "임영희", account: "하나은행 534-910057-49207" },
    { name: "최은희", account: "하나은행 407-910679-71307" },
  ],
  brideGive: [
    { name: "김민지", account: "카카오뱅크 3333-01-9202-440" },
    { name: "김대래", account: "농협 924-1223-1741" },
    { name: "정혜욱", account: "부산은행 078-010-224428" },
  ],
};

export default myContentSpec;
