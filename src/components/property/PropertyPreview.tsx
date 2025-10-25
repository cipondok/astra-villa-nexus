
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Eye, MapPin, Home, DollarSign, User, Building, Calendar, Ruler, X } from "lucide-react";
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Eye className="h-5 w-5 text-blue-600" />
              Preview Properti
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseAndHome}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              aria-label="Close and go home"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Property Info */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center justify-between text-gray-900">
                <span className="text-xl font-bold">{propertyData.title}</span>
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                  {propertyData.listing_type === 'sale' ? '💰 Dijual' : '🏠 Disewakan'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 bg-white">
              {/* Location */}
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">Lokasi:</span>
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
                <div className="flex items-center gap-2 text-green-700 font-semibold text-xl bg-green-50 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span>{formatIDR(Number(propertyData.price))}</span>
                </div>
              )}

              {/* Property Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-blue-50 p-3 rounded-lg">
                  <Building className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 font-medium">Tipe</p>
                  <p className="font-bold text-gray-900 capitalize">{propertyData.property_type}</p>
                </div>
                {propertyData.bedrooms && (
                  <div className="text-center bg-purple-50 p-3 rounded-lg">
                    <span className="text-2xl mb-2 block">🛏️</span>
                    <p className="text-sm text-gray-600 font-medium">Kamar Tidur</p>
                    <p className="font-bold text-gray-900">{propertyData.bedrooms}</p>
                  </div>
                )}
                {propertyData.bathrooms && (
                  <div className="text-center bg-green-50 p-3 rounded-lg">
                    <span className="text-2xl mb-2 block">🚿</span>
                    <p className="text-sm text-gray-600 font-medium">Kamar Mandi</p>
                    <p className="font-bold text-gray-900">{propertyData.bathrooms}</p>
                  </div>
                )}
                {propertyData.area_sqm && (
                  <div className="text-center bg-orange-50 p-3 rounded-lg">
                    <Ruler className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-gray-600 font-medium">Luas</p>
                    <p className="font-bold text-gray-900">{propertyData.area_sqm} m²</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {propertyData.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-gray-900">📝 Deskripsi</h4>
                  <p className="text-gray-700 leading-relaxed">{propertyData.description}</p>
                </div>
              )}

              {/* Additional Details */}
              {(propertyData.furnishing || propertyData.parking) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyData.furnishing && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-blue-700 font-medium">🪑 Kondisi:</span>
                      <span className="ml-2 text-gray-900 capitalize">{propertyData.furnishing.replace('-', ' ')}</span>
                    </div>
                  )}
                  {propertyData.parking && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-green-700 font-medium">🚗 Parkir:</span>
                      <span className="ml-2 text-gray-900">{propertyData.parking}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D Features */}
          {propertyData.has_3d_tour && (propertyData.three_d_model_url || propertyData.virtual_tour_url) && (
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <span className="text-xl">🥽</span>
                  Fitur 3D & Virtual Tour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 bg-white">
                {propertyData.three_d_model_url && (
                  <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                    <span className="text-purple-700 font-medium">🔗 Model 3D:</span>
                    <span className="text-gray-900 text-sm truncate max-w-xs">{propertyData.three_d_model_url}</span>
                  </div>
                )}
                {propertyData.virtual_tour_url && (
                  <div className="flex items-center justify-between bg-pink-50 p-3 rounded-lg">
                    <span className="text-pink-700 font-medium">🌐 Virtual Tour:</span>
                    <span className="text-gray-900 text-sm truncate max-w-xs">{propertyData.virtual_tour_url}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Property Images */}
          {propertyData.images && propertyData.images.length > 0 && (
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <span className="text-xl">📸</span>
                  Foto Properti ({propertyData.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {propertyData.images.map((url: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Properti ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition-transform"
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
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-orange-600" />
                Informasi Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-600 font-medium">Tipe Pemilik:</span>
                  <span className="text-gray-900 capitalize font-semibold">{propertyData.owner_type || 'Individual'}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                  <span className="text-yellow-700 font-medium">Status:</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    Menunggu Persetujuan
                  </Badge>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <span className="font-medium">ℹ️ Catatan:</span> Properti akan ditinjau oleh tim admin dalam 24 jam setelah pengajuan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4 bg-gray-50 flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCloseAndHome}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Close & Home
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            ✏️ Edit Properti
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
