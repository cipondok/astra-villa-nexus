import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  CreditCard, 
  Clock, 
  LogIn, 
  LogOut, 
  Ban, 
  Home, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

interface RentalTerm {
  id: string;
  term_type: string;
  title: string;
  description: string;
  is_mandatory: boolean;
  order_index: number;
}

interface RentalTermsProps {
  terms: RentalTerm[];
  compact?: boolean;
}

const RentalTerms: React.FC<RentalTermsProps> = ({ terms, compact = false }) => {
  const getTermIcon = (termType: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'deposit': CreditCard,
      'check_in': LogIn,
      'check_out': LogOut,
      'cancellation': Ban,
      'house_rules': Home,
      'payment': CreditCard,
      'booking': Clock
    };
    return icons[termType] || FileText;
  };

  const getTermColor = (termType: string, isMandatory: boolean) => {
    if (isMandatory) {
      const colors: Record<string, string> = {
        'deposit': 'bg-orange-100 text-orange-800 border-orange-200',
        'check_in': 'bg-green-100 text-green-800 border-green-200',
        'check_out': 'bg-blue-100 text-blue-800 border-blue-200',
        'cancellation': 'bg-red-100 text-red-800 border-red-200',
        'house_rules': 'bg-purple-100 text-purple-800 border-purple-200'
      };
      return colors[termType] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const getTermTypeLabel = (termType: string) => {
    const labels: Record<string, string> = {
      'deposit': 'Deposit & Jaminan',
      'check_in': 'Ketentuan Check-in',
      'check_out': 'Ketentuan Check-out',
      'cancellation': 'Kebijakan Pembatalan',
      'house_rules': 'Aturan Rumah',
      'payment': 'Pembayaran',
      'booking': 'Pemesanan'
    };
    return labels[termType] || termType;
  };

  const sortedTerms = [...terms].sort((a, b) => {
    // Mandatory terms first, then by order_index
    if (a.is_mandatory !== b.is_mandatory) {
      return a.is_mandatory ? -1 : 1;
    }
    return a.order_index - b.order_index;
  });

  if (compact) {
    // Compact view showing key terms only
    const keyTerms = sortedTerms.filter(term => 
      term.is_mandatory && ['deposit', 'check_in', 'check_out'].includes(term.term_type)
    ).slice(0, 3);

    return (
      <div className="space-y-2">
        {keyTerms.map((term) => {
          const IconComponent = getTermIcon(term.term_type);
          return (
            <div key={term.id} className="flex items-start space-x-2 text-sm">
              <IconComponent className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-700">{term.title}:</span>
                <span className="text-gray-600 ml-1">{term.description}</span>
              </div>
            </div>
          );
        })}
        {terms.length > 3 && (
          <p className="text-sm text-gray-500">
            +{terms.length - 3} syarat & ketentuan lainnya
          </p>
        )}
      </div>
    );
  }

  // Full view for property details
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Syarat & Ketentuan Sewa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTerms.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Syarat dan ketentuan sewa akan dikomunikasikan langsung oleh pemilik properti.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Mandatory Terms */}
            {sortedTerms.some(term => term.is_mandatory) && (
              <div>
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-semibold text-gray-900">Syarat Wajib</h3>
                </div>
                <div className="space-y-4">
                  {sortedTerms
                    .filter(term => term.is_mandatory)
                    .map((term) => {
                      const IconComponent = getTermIcon(term.term_type);
                      return (
                        <div
                          key={term.id}
                          className={`p-4 rounded-lg border-2 ${getTermColor(term.term_type, true)}`}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent className="h-5 w-5 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold">{term.title}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {getTermTypeLabel(term.term_type)}
                                </Badge>
                              </div>
                              <p className="text-sm leading-relaxed">{term.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Optional Terms */}
            {sortedTerms.some(term => !term.is_mandatory) && (
              <div>
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="font-semibold text-gray-900">Informasi Tambahan</h3>
                </div>
                <div className="space-y-3">
                  {sortedTerms
                    .filter(term => !term.is_mandatory)
                    .map((term) => {
                      const IconComponent = getTermIcon(term.term_type);
                      return (
                        <div
                          key={term.id}
                          className={`p-3 rounded-lg border ${getTermColor(term.term_type, false)}`}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent className="h-4 w-4 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm">{term.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {getTermTypeLabel(term.term_type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{term.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RentalTerms;