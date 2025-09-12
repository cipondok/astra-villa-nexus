import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Building2, ArrowRight } from 'lucide-react';

interface CategoryRequiredMessageProps {
  title: string;
  description: string;
  onNavigateToProfile?: () => void;
}

const CategoryRequiredMessage = ({ 
  title, 
  description, 
  onNavigateToProfile 
}: CategoryRequiredMessageProps) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Untuk mengakses fitur ini, Anda harus terlebih dahulu memilih kategori bisnis utama di profil bisnis Anda.
          </AlertDescription>
        </Alert>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Langkah-langkah yang diperlukan:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Buka tab "Profile" pada dashboard vendor</li>
            <li>Pilih kategori utama bisnis Anda</li>
            <li>Simpan pengaturan profil bisnis</li>
            <li>Kembali ke tab ini untuk melanjutkan</li>
          </ol>
        </div>
        
        {onNavigateToProfile && (
          <div className="flex justify-center pt-4">
            <Button onClick={onNavigateToProfile} className="gap-2">
              Pergi ke Profil Bisnis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryRequiredMessage;