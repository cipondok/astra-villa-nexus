
import { useEffect, useState } from "react";
import { CheckCircle, Sparkles, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const CelebrationPopup = ({ 
  isOpen, 
  onClose, 
  title = "🎉 Selamat!", 
  message = "Properti Anda berhasil diajukan untuk review!" 
}: CelebrationPopupProps) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowFireworks(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowFireworks(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Fireworks CSS */}
      <style>
        {`
          @keyframes firework {
            0% { 
              transform: translate(var(--x), var(--y)) scale(0); 
              opacity: 1; 
            }
            50% { 
              transform: translate(var(--x), var(--y)) scale(1); 
              opacity: 1; 
            }
            100% { 
              transform: translate(var(--x), var(--y)) scale(0); 
              opacity: 0; 
            }
          }
          
          @keyframes sparkle {
            0%, 100% { 
              transform: scale(0) rotate(0deg); 
              opacity: 0; 
            }
            50% { 
              transform: scale(1) rotate(180deg); 
              opacity: 1; 
            }
          }
          
          @keyframes float-up {
            0% { 
              transform: translateY(20px); 
              opacity: 0; 
            }
            100% { 
              transform: translateY(-100px); 
              opacity: 0; 
            }
          }
          
          @keyframes pulse-scale {
            0%, 100% { 
              transform: scale(1); 
            }
            50% { 
              transform: scale(1.1); 
            }
          }
          
          .firework {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: firework 1.5s ease-out infinite;
          }
          
          .firework-1 {
            background: #ff6b6b;
            --x: -100px;
            --y: -100px;
            animation-delay: 0s;
          }
          
          .firework-2 {
            background: #4ecdc4;
            --x: 100px;
            --y: -120px;
            animation-delay: 0.3s;
          }
          
          .firework-3 {
            background: #45b7d1;
            --x: -80px;
            --y: 80px;
            animation-delay: 0.6s;
          }
          
          .firework-4 {
            background: #96ceb4;
            --x: 120px;
            --y: 60px;
            animation-delay: 0.9s;
          }
          
          .firework-5 {
            background: #feca57;
            --x: 0px;
            --y: -140px;
            animation-delay: 1.2s;
          }
          
          .sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }
          
          .float-up {
            animation: float-up 3s ease-out infinite;
          }
          
          .pulse-scale {
            animation: pulse-scale 2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        {/* Fireworks Container */}
        {showFireworks && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="firework firework-1"></div>
            <div className="firework firework-2"></div>
            <div className="firework firework-3"></div>
            <div className="firework firework-4"></div>
            <div className="firework firework-5"></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-1/4 left-1/4 text-gold-primary sparkle">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="absolute top-1/3 right-1/4 text-destructive sparkle" style={{ animationDelay: '0.5s' }}>
              <Star className="h-5 w-5" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 text-chart-4 sparkle" style={{ animationDelay: '1s' }}>
              <Heart className="h-4 w-4" />
            </div>
            <div className="absolute top-1/2 right-1/3 text-chart-1 sparkle" style={{ animationDelay: '1.5s' }}>
              <Sparkles className="h-5 w-5" />
            </div>
            
            {/* More floating elements */}
            <div className="absolute bottom-1/4 right-1/2 text-accent-foreground float-up">
              <Star className="h-3 w-3" />
            </div>
            <div className="absolute top-1/2 left-1/2 text-chart-3 float-up" style={{ animationDelay: '0.8s' }}>
              <Heart className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {/* Celebration Modal */}
        <div className="bg-card rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-primary/30 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 opacity-60"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="bg-gradient-to-r from-chart-1 to-primary rounded-full p-4 pulse-scale">
                <CheckCircle className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </h2>
            
            {/* Message */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {message}
            </p>
            
            {/* Additional Info */}
            <div className="bg-chart-4/10 rounded-lg p-4 mb-6 border border-chart-4/20">
              <p className="text-sm text-chart-4">
                <span className="font-semibold">📧 Tim admin kami akan meninjau properti Anda dalam 24 jam</span>
              </p>
              <p className="text-xs text-chart-4/70 mt-1">
                Anda akan mendapat notifikasi email setelah review selesai
              </p>
            </div>
            
            {/* Action Button */}
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              Kembali ke Beranda ✨
            </Button>
            
            {/* Auto close indicator */}
            <p className="text-xs text-muted-foreground mt-4">
              Popup ini akan otomatis tertutup dalam 5 detik
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationPopup;
