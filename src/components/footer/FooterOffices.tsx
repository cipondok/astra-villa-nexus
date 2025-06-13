
import { MapPin, Building } from "lucide-react";

interface FooterOfficesProps {
  language: "en" | "id";
}

const FooterOffices = ({ language }: FooterOfficesProps) => {
  const text = {
    en: {
      offices: "Our Offices",
      jakartaHead: "Jakarta Head Office",
      jakartaAddress: "Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220",
      baliRegional: "Bali Regional Office",
      baliAddress: "Jl. Raya Sanur No. 88, Denpasar, Bali 80228",
      surabayaBranch: "Surabaya Branch",
      surabayaAddress: "Jl. Pemuda No. 118, Surabaya, East Java 60271",
      bandungBranch: "Bandung Branch",
      bandungAddress: "Jl. Asia Afrika No. 8, Bandung, West Java 40111",
      medanBranch: "Medan Branch",
      medanAddress: "Jl. Jend. Gatot Subroto No. 456, Medan, North Sumatra 20234",
    },
    id: {
      offices: "Kantor Kami",
      jakartaHead: "Kantor Pusat Jakarta",
      jakartaAddress: "Menara Astra, Jl. Jend. Sudirman Kav. 5-6, Jakarta 10220",
      baliRegional: "Kantor Regional Bali",
      baliAddress: "Jl. Raya Sanur No. 88, Denpasar, Bali 80228",
      surabayaBranch: "Cabang Surabaya",
      surabayaAddress: "Jl. Pemuda No. 118, Surabaya, Jawa Timur 60271",
      bandungBranch: "Cabang Bandung",
      bandungAddress: "Jl. Asia Afrika No. 8, Bandung, Jawa Barat 40111",
      medanBranch: "Cabang Medan",
      medanAddress: "Jl. Jend. Gatot Subroto No. 456, Medan, Sumatera Utara 20234",
    }
  };

  const currentText = text[language];

  const offices = [
    { name: currentText.jakartaHead, address: currentText.jakartaAddress },
    { name: currentText.baliRegional, address: currentText.baliAddress },
    { name: currentText.surabayaBranch, address: currentText.surabayaAddress },
    { name: currentText.bandungBranch, address: currentText.bandungAddress },
    { name: currentText.medanBranch, address: currentText.medanAddress },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Building className="h-4 w-4 text-primary" />
        {currentText.offices}
      </h4>
      <ul className="space-y-3">
        {offices.map((office, index) => (
          <li key={index} className="space-y-1">
            <div className="font-medium text-foreground text-xs">
              {office.name}
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-3 w-3 text-ios-blue mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground text-xs leading-relaxed">
                {office.address}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterOffices;
