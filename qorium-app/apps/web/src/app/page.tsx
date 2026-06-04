import { MarketingPage, StructuredData, generateMarketingMetadata } from "../marketing/MarketingPage";

export const metadata = generateMarketingMetadata("/");

export default function Page() {
  return (
    <>
      <StructuredData path="/" />
      <MarketingPage path="/" />
    </>
  );
}
