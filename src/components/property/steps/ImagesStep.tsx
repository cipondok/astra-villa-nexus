import PropertyImageUpload from "../PropertyImageUpload";

interface ImagesStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const ImagesStep = ({ formData, onUpdate }: ImagesStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Property Images</h3>
        <p className="text-sm text-muted-foreground">
          Upload high-quality images of your property. The first image will be used as the main thumbnail.
        </p>
      </div>

      <PropertyImageUpload
        propertyType={formData.property_type}
        onImagesUploaded={(imageUrls) => onUpdate('images', imageUrls)}
        maxImages={10}
      />

      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="font-semibold mb-2">Image Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use natural lighting for best results</li>
          <li>• Include photos of all rooms and exterior</li>
          <li>• Highlight unique features</li>
          <li>• Ensure images are clear and high resolution</li>
          <li>• Upload at least 5 images for better visibility</li>
        </ul>
      </div>
    </div>
  );
};

export default ImagesStep;
