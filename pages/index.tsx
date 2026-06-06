import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import Home from "@/components/home";
import myContentSpec, { Content } from "@/content";
import {
  InvitationSide,
  parseInvitationSide,
  parseInvitationSideOverride,
  parseInvitationVariant,
} from "@/variant";

type HomePageProps = { content: Content; primarySide: InvitationSide };

const HomePage = ({ content: c, primarySide }: HomePageProps) => {
  const router = useRouter();
  const variant = parseInvitationVariant(router.query.v);
  const queryPrimarySide =
    process.env.NODE_ENV === "development"
      ? parseInvitationSideOverride(router.query.side)
      : undefined;
  const resolvedPrimarySide = queryPrimarySide ?? primarySide;
  const htmlTitle =
    resolvedPrimarySide === "groom" ? c.groomHtmlTitle : c.brideHtmlTitle;
  const htmlDesc =
    resolvedPrimarySide === "groom" ? c.groomHtmlDesc : c.brideHtmlDesc;
  const ogTitle =
    resolvedPrimarySide === "groom" ? c.groomOgTitle : c.brideOgTitle;

  return (
    <>
      <Head>
        <title>{htmlTitle}</title>
        <meta name="description" content={htmlDesc} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={c.ogDesc} />
        <meta property="og:image" content={c.ogImageUrl} />
      </Head>
      <Home content={c} variant={variant} primarySide={resolvedPrimarySide} />
    </>
  );
};
export default HomePage;

export const getStaticProps: GetStaticProps = () => {
  const photos: Content["photos"] = Array.from({ length: 9 }, (_, index) => {
    const filename = `p${String(index + 1).padStart(2, "0")}.jpg`;

    return {
      url: `/photos/gallery/${filename}`,
      ...(myContentSpec.galleryThumbPosition[filename]
        ? { objectPosition: myContentSpec.galleryThumbPosition[filename] }
        : {}),
    };
  });

  const content: Content = { ...myContentSpec, photos };
  const primarySide = parseInvitationSide(process.env.INVITATION_PRIMARY_SIDE);
  return { props: { content, primarySide } };
};
