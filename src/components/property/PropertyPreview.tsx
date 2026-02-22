
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, MapPin, Home, DollarSign, User, Building, Calendar, Ruler, X, Key, Tag } from "lucide-react";

// Helper to capitalize first letter
const capitalizeFirst = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'Property';
import { formatIDR } from "@/utils/currency";
import { useNavigate } from 'react-router-dom';

interface PropertyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyData: any;
  isSubmitting: boolean;
}

const PropertyPreview = ({ isOpen, onClose, onConfirm, propertyData, isSubmitting }: PropertyPreviewProps) => {
  const navigate = useNavigate();

  const handleCloseAndHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Eye className="h-5 w-5 text-primary" />
              Preview Properti
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseAndHome}
              className="h-8 w-8 p-0 hover:bg-muted rounded-full"
              aria-label="Close and go home"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Property Info */}
          <Card className="border border-border bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="text-xl font-bold">{propertyData.title}</span>
                <Badge variant="outline" className={`flex items-center gap-0.5 text-[10px] ${propertyData.listing_type === 'sale' ? 'bg-chart-1 text-primary-foreground border-chart-1/60' : 'bg-chart-4 text-primary-foreground border-chart-4/60'}`}>
                  {propertyData.listing_type === 'sale' ? <Tag className="h-3 w-3" /> : <Key className="h-3 w-3" />}
                  {propertyData.listing_type === 'sale' ? 'Jual' : 'Sewa'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 bg-card">
              {/* Location */}
              <div className="flex items-center gap-2 text-foreground bg-muted/50 p-3 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Lokasi:</span>
                  <span className="ml-2">
                    {propertyData.area && propertyData.city && propertyData.state ? (
                      `${propertyData.area}, ${propertyData.city}, ${propertyData.state}`
                    ) : (
                      propertyData.location || 'Belum ditentukan'
                    )}
                  </span>
                </div>
              </div>

              {/* Price */}
              {propertyData.price && (
                <div className="flex items-center gap-2 text-chart-1 font-semibold text-xl bg-chart-1/10 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-chart-1" />
                  <span>{formatIDR(Number(propertyData.price))}</span>
                </div>
              )}

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-chart-4/10 p-3 rounded-lg">
                  <Building className="h-6 w-6 mx-auto mb-2 text-chart-4" />
                  <p className="text-sm text-muted-foreground font-medium">Tipe</p>
                  <p className="font-bold text-foreground capitalize">{capitalizeFirst(propertyData.property_type)}</p>
                </div>
                {propertyData.bedrooms && (
                  <div className="text-center bg-chart-5/10 p-3 rounded-lg">
                    <span className="text-2xl mb-2 block">🛏️</span>
                    <p className="text-sm text-muted-foreground font-medium">Kamar Tidur</p>
                    <p className="font-bold text-foreground">{propertyData.bedrooms}</p>
                  </div>
                )}
                {propertyData.bathrooms && (
                  <div className="text-center bg-chart-1/10 p-3 rounded-lg">
                    <span className="text-2xl mb-2 block">🚿</span>
                    <p className="text-sm text-muted-foreground font-medium">Kamar Mandi</p>
                    <p className="font-bold text-foreground">{propertyData.bathrooms}</p>
                  </div>
                )}
                {propertyData.area_sqm && (
                  <div className="text-center bg-chart-3/10 p-3 rounded-lg">
                    <Ruler className="h-6 w-6 mx-auto mb-2 text-chart-3" />
                    <p className="text-sm text-muted-foreground font-medium">Luas</p>
                    <p className="font-bold text-foreground">{propertyData.area_sqm} m²</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {propertyData.description && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-foreground">📝 Deskripsi</h4>
                  <p className="text-muted-foreground leading-relaxed">{propertyData.description}</p>
                </div>
              )}

              {/* Additional Details */}
              {(propertyData.furnishing || propertyData.parking) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyData.furnishing && (
                    <div className="bg-chart-4/10 p-3 rounded-lg">
                      <span className="text-chart-4 font-medium">🪑 Kondisi:</span>
                      <span className="ml-2 text-foreground capitalize">{propertyData.furnishing.replace('-', ' ')}</span>
                    </div>
                  )}
                  {propertyData.parking && (
                    <div className="bg-chart-1/10 p-3 rounded-lg">
                      <span className="text-chart-1 font-medium">🚗 Parkir:</span>
                      <span className="ml-2 text-foreground">{propertyData.parking}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Features */}
          {propertyData.has_3d_tour && (propertyData.three_d_model_url || propertyData.virtual_tour_url) && (
            <Card className="border border-border bg-card">
              <CardHeader className="bg-gradient-to-r from-chart-5/10 to-accent/10">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <span className="text-xl">🥽</span>
                  Fitur 3D & Virtual Tour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 bg-card">
                {propertyData.three_d_model_url && (
                  <div className="flex items-center justify-between bg-chart-5/10 p-3 rounded-lg">
                    <span className="text-chart-5 font-medium">🔗 Model 3D:</span>
                    <span className="text-foreground text-sm truncate max-w-xs">{propertyData.three_d_model_url}</span>
                  </div>
                )}
                {propertyData.virtual_tour_url && (
                  <div className="flex items-center justify-between bg-accent/10 p-3 rounded-lg">
                    <span className="text-accent-foreground font-medium">🌐 Virtual Tour:</span>
                    <span className="text-foreground text-sm truncate max-w-xs">{propertyData.virtual_tour_url}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Property Images */}
          {propertyData.images && propertyData.images.length > 0 && (
            <Card className="border border-border bg-card">
              <CardHeader className="bg-gradient-to-r from-chart-1/10 to-chart-4/10">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <span className="text-xl">📸</span>
                  Foto Properti ({propertyData.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-card">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {propertyData.images.map((url: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Properti ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Foto {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card className="border border-border bg-card">
            <CardHeader className="bg-gradient-to-r from-chart-3/10 to-accent/10">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-chart-3" />
                Informasi Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                  <span className="text-muted-foreground font-medium">Tipe Pemilik:</span>
                  <span className="text-foreground capitalize font-semibold">{propertyData.owner_type || 'Individual'}</span>
                </div>
                <div className="flex justify-between items-center bg-chart-3/10 p-3 rounded-lg">
                  <span className="text-chart-3 font-medium">Status:</span>
                  <Badge variant="outline" className="bg-chart-3/20 text-chart-3 border-chart-3/30">
                    <Calendar className="h-3 w-3 mr-1" />
                    Menunggu Persetujuan
                  </Badge>
                </div>
              </div>
              <div className="bg-chart-4/10 p-4 rounded-lg border border-chart-4/20">
                <p className="text-chart-4 text-sm">
                  <span className="font-medium">ℹ️ Catatan:</span> Properti akan ditinjau oleh tim admin dalam 24 jam setelah pengajuan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t border-border pt-4 bg-muted/30 flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCloseAndHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Close & Home
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            ✏️ Edit Properti
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-gold-primary to-gold-primary/80 hover:from-gold-primary/90 hover:to-gold-primary/70 text-primary-foreground"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Mengirim...
              </>
            ) : (
              <>
                <span className="mr-2">✅</span>
                Kirim untuk Persetujuan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyPreview;
