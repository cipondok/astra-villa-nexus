
import { MapPin, Building, Phone, Clock } from "lucide-react";

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
      businessHours: "Mon-Fri: 9:00 AM - 6:00 PM",
      phone: "Phone",
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
      businessHours: "Sen-Jum: 09:00 - 18:00",
      phone: "Telepon",
    }
  };

  const currentText = text[language];

  const offices = [
    { 
      name: currentText.jakartaHead, 
      address: currentText.jakartaAddress,
      phone: "+62 21 1234 5678",
      isMain: true
    },
    { 
      name: currentText.baliRegional, 
      address: currentText.baliAddress,
      phone: "+62 361 234 567",
      isMain: false
    },
    { 
      name: currentText.surabayaBranch, 
      address: currentText.surabayaAddress,
      phone: "+62 31 345 678",
      isMain: false
    },
    { 
      name: currentText.bandungBranch, 
      address: currentText.bandungAddress,
      phone: "+62 22 456 789",
      isMain: false
    },
    { 
      name: currentText.medanBranch, 
      address: currentText.medanAddress,
      phone: "+62 61 567 890",
      isMain: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-bold text-foreground text-lg">
          {currentText.offices}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {offices.map((office, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              office.isMain 
                ? 'bg-primary/5 border-primary/20 hover:border-primary/30' 
                : 'bg-muted/30 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                {office.isMain && (
                  <div className="p-1 bg-primary/20 rounded text-primary">
                    <Building className="h-3 w-3" />
                  </div>
                )}
                <div className="font-semibold text-foreground text-sm leading-tight">
                  {office.name}
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-xs leading-relaxed">
                  {office.address}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-foreground text-xs font-medium">
                  {office.phone}
                </span>
              </div>
              
              <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground text-xs">
                  {currentText.businessHours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterOffices;
