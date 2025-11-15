import { useState } from "react";
import { Button } from "@/components/ui/button";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";
import { toast } from "sonner";
import astraLogo from "@/assets/astra-logo.png";

const BackgroundRemovalTool = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    try {
      toast.info("Loading image...");
      
      // Fetch the logo image
      const response = await fetch(astraLogo);
      const blob = await response.blob();
      
      toast.info("Removing background... This may take a moment.");
      
      // Load and process the image
      const imageElement = await loadImage(blob);
      const resultBlob = await removeBackground(imageElement);
      
      // Create a URL for the processed image
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'astra-logo-no-bg.png';
      a.click();
      
      toast.success("Background removed successfully! Image downloaded.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-background border rounded-lg shadow-lg">
      <h3 className="text-sm font-medium mb-2">Background Removal Tool</h3>
      <Button 
        onClick={handleRemoveBackground}
        disabled={isProcessing}
        size="sm"
      >
        {isProcessing ? "Processing..." : "Remove Logo Background"}
      </Button>
      {processedImage && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <img 
            src={processedImage} 
            alt="Processed" 
            className="w-24 h-24 border rounded"
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundRemovalTool;
