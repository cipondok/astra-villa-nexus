export const shareProperty = async (property: {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[];
}) => {
  const url = `${window.location.origin}/properties/${property.id}`;
  const shareText = `Check out this property: ${property.title} in ${property.location}`;

  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: property.title,
        text: shareText,
        url: url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText} - ${url}`);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }
  
  return false;
};