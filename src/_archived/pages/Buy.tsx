import PropertyListingPage from "./PropertyListingPage";
import { useTranslation } from "@/i18n/useTranslation";

const Buy = () => {
  const { t } = useTranslation();
  return (
    <PropertyListingPage
      pageType="buy"
      title={t('listingPage.buyTitle')}
      subtitle={t('listingPage.buySubtitle')}
    />
  );
};

export default Buy;
