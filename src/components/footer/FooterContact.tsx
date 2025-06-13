
import { MapPin, Phone, Mail } from "lucide-react";

interface FooterContactProps {
  language: "en" | "id";
}

const FooterContact = ({ language }: FooterContactProps) => {
  const text = {
    en: {
      contact: "Contact Info",
      address: "123 Property Street, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
    },
    id: {
      contact: "Info Kontak",
      address: "Jl. Properti No. 123, Jakarta, Indonesia",
      phone: "+62 21 1234 5678",
      email: "info@astravilla.com",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm">
        {currentText.contact}
      </h4>
      <ul className="space-y-3">
        <li className="flex items-start space-x-3">
          <MapPin className="h-4 w-4 text-ios-blue mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground text-sm">
            {currentText.address}
          </span>
        </li>
        <li className="flex items-center space-x-3">
          <Phone className="h-4 w-4 text-ios-blue flex-shrink-0" />
          <span className="text-muted-foreground text-sm">
            {currentText.phone}
          </span>
        </li>
        <li className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-ios-blue flex-shrink-0" />
          <span className="text-muted-foreground text-sm">
            {currentText.email}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default FooterContact;
