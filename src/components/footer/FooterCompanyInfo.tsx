
import { Building, Heart, Users, Target, MessageSquare, TrendingUp, Award } from "lucide-react";

interface FooterCompanyInfoProps {
  language: "en" | "id";
  onLinkClick: (path: string, label?: string) => void;
}

const FooterCompanyInfo = ({ language, onLinkClick }: FooterCompanyInfoProps) => {
  const text = {
    en: {
      aboutUs: "About Us",
      ourStory: "Our Story",
      leadership: "Leadership Team",
      careers: "Careers",
      pressMedia: "Press & Media",
      investorRelations: "Investor Relations",
      corporateSocial: "Corporate Social Responsibility",
    },
    id: {
      aboutUs: "Tentang Kami",
      ourStory: "Cerita Kami",
      leadership: "Tim Kepemimpinan",
      careers: "Karir",
      pressMedia: "Pers & Media",
      investorRelations: "Hubungan Investor",
      corporateSocial: "Tanggung Jawab Sosial Perusahaan",
    }
  };

  const currentText = text[language];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
        <Building className="h-4 w-4 text-primary" />
        {currentText.aboutUs}
      </h4>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => onLinkClick('/about', currentText.ourStory)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Heart className="h-3 w-3" />
            {currentText.ourStory}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/leadership', currentText.leadership)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Users className="h-3 w-3" />
            {currentText.leadership}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/careers', currentText.careers)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Target className="h-3 w-3" />
            {currentText.careers}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/press-media', currentText.pressMedia)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <MessageSquare className="h-3 w-3" />
            {currentText.pressMedia}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/investor-relations', currentText.investorRelations)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <TrendingUp className="h-3 w-3" />
            {currentText.investorRelations}
          </button>
        </li>
        <li>
          <button 
            onClick={() => onLinkClick('/corporate-social', currentText.corporateSocial)}
            className="text-muted-foreground hover:text-primary transition-colors text-sm text-left flex items-center gap-2 w-full"
          >
            <Award className="h-3 w-3" />
            {currentText.corporateSocial}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default FooterCompanyInfo;
