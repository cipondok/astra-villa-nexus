import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  Edit, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  DollarSign,
  PlusCircle,
  Tag,
  Key
} from "lucide-react";
import Price from "@/components/ui/Price";

const DemoPropertyList = () => {
  const navigate = useNavigate();

  const demoProperties = [
    {
      id: "demo-1",
      title: "Modern Villa di Canggu",
      description: "Villa mewah dengan akses pantai langsung, 5 kamar tidur dan fasilitas lengkap.",
      price: 4500000000,
      property_type: "villa",
      listing_type: "sale",
      location: "Canggu, Bali",
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 450,
      status: "approved",
      image_urls: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"],
      created_at: "2024-01-15"
    },
    {
      id: "demo-2", 
      title: "Apartemen Executive Kemang",
      description: "Apartemen mewah di area prestigious Kemang dengan fasilitas kolam renang dan gym.",
      price: 12000000,
      property_type: "apartment",
      listing_type: "rent",
      location: "Kemang, South Jakarta",
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 85,
      status: "pending_approval",
      image_urls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"],
      created_at: "2024-01-10"
    },
    {
      id: "demo-3",
      title: "Rumah Keluarga di BSD",
      description: "Rumah modern minimalis dalam cluster yang aman dan ramah keluarga.",
      price: 1250000000,
      property_type: "house", 
      listing_type: "sale",
      location: "BSD City, Tangerang",
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      status: "approved",
      image_urls: ["https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=800&h=600&fit=crop"],
      created_at: "2024-01-08"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'pending_approval':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Disetujui';
      case 'pending_approval':
        return '⏳ Menunggu Persetujuan';
      case 'rejected':
        return '❌ Ditolak';
      default:
        return status;
    }
  };

  const getListingTypeText = (type: string) => {
    return type === 'sale' ? 'Dijual' : 'Disewa';
  };

  const getListingTypeGradient = (type: string) => {
    return type === 'sale'
      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-md'
      : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-md';
  };

  const getPropertyTypeText = (type: string) => {
    const types = {
      'house': '🏠 Rumah',
      'apartment': '🏢 Apartemen', 
      'villa': '🏖️ Villa',
      'condo': '🏙️ Kondominium',
      'land': '🌍 Tanah',
      'commercial': '🏪 Komersial'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Properti Saya</CardTitle>
            <CardDescription>
              Demo properti untuk testing fungsi properti owner
            </CardDescription>
          </div>
          <Button 
            onClick={() => navigate('/add-property')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Properti Baru
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {demoProperties.map((property) => (
            <Card key={property.id} className="border border-border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Property Image */}
                  <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={property.image_urls[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Property Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getStatusColor(property.status)}>
                            {getStatusText(property.status)}
                          </Badge>
                          <Badge className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${getListingTypeGradient(property.listing_type)}`}>
                            {property.listing_type === 'sale' ? <Tag className="h-3 w-3" /> : <Key className="h-3 w-3" />}
                            {getListingTypeText(property.listing_type)}
                          </Badge>
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            {getPropertyTypeText(property.property_type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-chart-1">
                          <Price amount={property.price} />
                          {property.listing_type === 'rent' && '/bulan'}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {property.bedrooms} Kamar
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms} Kamar Mandi
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {property.area_sqm} m²
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Ditambahkan: {new Date(property.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Melihat detail properti: ${property.title}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => alert(`Edit properti: ${property.title}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Empty State */}
          {demoProperties.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <PlusCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Properti</h3>
              <p className="mb-4">Mulai dengan menambahkan properti pertama Anda</p>
              <Button 
                onClick={() => navigate('/add-property')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Properti Pertama
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoPropertyList;
