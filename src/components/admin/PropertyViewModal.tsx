
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Home, User, UserCheck, Calendar, DollarSign, Edit2, Image as ImageIcon, Wand2, Eye } from "lucide-react";
import { formatIDR } from "@/utils/currency";
import { useAlert } from "@/contexts/AlertContext";

interface PropertyViewModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (property: any) => void;
}

const PropertyViewModal = ({ property, isOpen, onClose, onEdit }: PropertyViewModalProps) => {
  const [generatingImage, setGeneratingImage] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const { showSuccess, showError } = useAlert();

  if (!property) return null;

  const handleEdit = () => {
    onEdit?.(property);
    onClose();
  };

  // Parse images - handle both string and array formats
  const getPropertyImages = () => {
    const imageSources = [
      property.images,
      property.image_urls,
      property.thumbnail_url ? [property.thumbnail_url] : null
    ];

    for (const source of imageSources) {
      if (!source) continue;
      
      try {
        if (typeof source === 'string') {
          // Check if it's a JSON string
          if (source.startsWith('[') || source.startsWith('{')) {
            try {
              const parsed = JSON.parse(source);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            } catch {
              // Not JSON, treat as single URL
              return [source];
            }
          } else {
            // Single URL string
            return [source];
          }
        }
        
        if (Array.isArray(source) && source.length > 0) {
          return source;
        }
      } catch (error)  {
        console.warn('Error parsing image source:', error);
      }
    }
    
    return [];
  };

  let propertyImages = getPropertyImages();
  
  // Add AI generated image if available
  if (aiGeneratedImage) {
    propertyImages = [aiGeneratedImage, ...propertyImages];
  }

  // Generate AI image for property
  const generateAIImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = `A beautiful ${property.property_type || 'house'} in ${property.location || 'Indonesia'}, ${property.bedrooms || 2} bedrooms, ${property.bathrooms || 1} bathrooms, modern architecture, well-lit, professional real estate photography`;
      
      console.log('Generating AI image with prompt:', prompt);
      
      const response = await fetch('/api/generate-property-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.image) {
        console.log('AI image generated successfully');
        setAiGeneratedImage(data.image);
        showSuccess("Success", "AI image generated successfully");
      }
    } catch (error) {
      console.error('Error generating AI image:', error);
      showError("Error", "Failed to generate AI image");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-6 bg-gradient-to-r from-blue-600 to-purple-600 -mx-6 -mt-6 px-6 pt-6 text-white">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{property.title}</h1>
                <p className="text-blue-100 text-sm font-normal mt-1">Property Details & Information</p>
              </div>
            </div>
            {onEdit && (
              <Button onClick={handleEdit} size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Property
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] px-1">
          <div className="space-y-8 py-6">
            {/* Property Images */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Property Gallery
                  <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {propertyImages.length} Images
                  </span>
                </h3>
              </div>
              
              {propertyImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propertyImages.map((image: string, index: number) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={image}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <Button
                          size="sm"
                          className="bg-white/90 hover:bg-white text-slate-800 backdrop-blur-sm"
                          onClick={() => window.open(image, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      </div>
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit mx-auto mb-4">
                    <ImageIcon className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Images Available</h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Generate a professional property image using AI</p>
                  <Button
                    onClick={generateAIImage}
                    disabled={generatingImage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  >
                    {generatingImage ? (
                      <>
                        <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Generate AI Image
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Property Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Basic Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Location</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{property.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                    <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Price</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {property.price ? formatIDR(property.price) : 'Price not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
                      {property.property_type}
                    </Badge>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-2">
                      {property.listing_type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Specifications
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {property.bedrooms || 'N/A'}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Bedrooms</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {property.bathrooms || 'N/A'}
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Bathrooms</p>
                    </div>
                    <div className="col-span-2 text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {property.area_sqm || 'N/A'} <span className="text-lg">sqm</span>
                      </p>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                <h3 className="text-lg font-bold text-white">Status & Timeline</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Badge className={`px-4 py-2 text-sm font-medium ${
                    property.status === 'active' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                  }`}>
                    Status: {property.status || 'pending_approval'}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2">
                    Created: {new Date(property.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4">
                  <h3 className="text-lg font-bold text-white">Property Description</h3>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                      {property.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Details */}
            {(property.city || property.state || property.area) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4">
                  <h3 className="text-lg font-bold text-white">Location Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {property.city && (
                      <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{property.city}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">City</p>
                      </div>
                    )}
                    {property.state && (
                      <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{property.state}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">State</p>
                      </div>
                    )}
                    {property.area && (
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{property.area}</p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Area</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyViewModal;
