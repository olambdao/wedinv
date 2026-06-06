import { GoogleAnalytics } from "@next/third-parties/google";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Reset } from "styled-reset";
import { SWRConfig } from "swr";
import "slick-carousel/slick/slick.css";
import "../global.css";

const swrConfig = {
  refreshInterval: 3000,
  fetcher: (url: string) => fetch(url).then((res) => res.json()),
};

function MyApp({ Component, pageProps }: AppProps) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_LOGROCKET_APPID) return;
    if (typeof window === "undefined") return;
    if (
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1")
    ) {
      return;
    }

    (async () => {
      const LogRocket = (await import("logrocket")).default;
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APPID as string);
    })();
  }, []);

  return (
    <>
      <Reset />
      <SWRConfig value={swrConfig}>
        <Component {...pageProps} />
      </SWRConfig>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  );
}
export default MyApp;
