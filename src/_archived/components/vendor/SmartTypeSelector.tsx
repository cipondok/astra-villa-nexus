import { Card, CardContent } from "@/components/ui/card";

interface TypeOption {
  id: 'product' | 'service';
  name: string;
  icon: string;
  desc: string;
  examples: string[];
}

interface SmartTypeSelectorProps {
  onSelect: (type: 'product' | 'service') => void;
  selectedType?: 'product' | 'service' | null;
}

const SmartTypeSelector = ({ onSelect, selectedType }: SmartTypeSelectorProps) => {
  const options: TypeOption[] = [
    { 
      id: 'product', 
      name: 'Jual Produk', 
      icon: '🛍️', 
      desc: 'Furnitur, alat rumah tangga',
      examples: ['Sofa', 'Tempat Tidur', 'Kulkas', 'AC']
    },
    { 
      id: 'service', 
      name: 'Tawarkan Jasa', 
      icon: '🛠️', 
      desc: 'Pembersihan, perbaikan, sewa',
      examples: ['Cleaning', 'Service AC', 'Sewa Mobil', 'Pindahan']
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Pilih Jenis Bisnis Anda</h2>
        <p className="text-muted-foreground">Apa yang ingin Anda tawarkan di platform kami?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {options.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedType === option.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onSelect(option.id)}
          >
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{option.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{option.name}</h3>
              <p className="text-muted-foreground mb-4">{option.desc}</p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Contoh:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {option.examples.map((example) => (
                    <span 
                      key={example}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedType === option.id && (
                <div className="mt-4 flex items-center justify-center text-primary font-medium">
                  <span className="mr-2">✓</span> Dipilih
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SmartTypeSelector;