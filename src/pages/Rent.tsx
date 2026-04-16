import PropertyListingPage from "./PropertyListingPage";
import { useTranslation } from "@/i18n/useTranslation";

const Rent = () => {
  const { t } = useTranslation();
  return (
    <PropertyListingPage
      pageType="rent"
      title={t('listingPage.rentTitle')}
      subtitle={t('listingPage.rentSubtitle')}
    />
  );
};

export default Rent;
