export const shareProperty = async (property: {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[];
}) => {
  const url = `${window.location.origin}/properties/${property.id}`;
  const shareText = `Check out this property: ${property.title} in ${property.location}`;

  // Check if Web Share API is supported and not in iframe
  if (navigator.share && window.parent === window) {
    try {
      await navigator.share({
        title: property.title,
        text: shareText,
        url: url,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      // Fall through to clipboard fallback
    }
  }
  
  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(`${shareText} - ${url}`);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Final fallback: Create a temporary input element
    try {
      const tempInput = document.createElement('input');
      tempInput.value = `${shareText} - ${url}`;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      return true;
    } catch (fallbackError) {
      console.error('All sharing methods failed:', fallbackError);
    }
  }
  
  return false;
};