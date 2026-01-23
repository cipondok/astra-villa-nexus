export const shareProperty = async (property: {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[];
}) => {
  const url = `${window.location.origin}/properties/${property.id}`;
  const shareText = `Check out this property: ${property.title} in ${property.location}`;
  const fullText = `${shareText} - ${url}`;

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
      // User cancelled or share failed - fall through to clipboard
      console.log('Native share cancelled or failed, trying clipboard');
    }
  }
  
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch (error) {
      console.log('Clipboard API failed, trying fallback');
    }
  }

  // Fallback: Create a temporary textarea element (more reliable than input)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    
    // Make it invisible but keep it in the DOM
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', ''); // Prevent keyboard on mobile
    
    document.body.appendChild(textArea);
    
    // Select the text - handle iOS specifically
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    textArea.setSelectionRange(0, fullText.length); // For iOS
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (success) {
      return true;
    }
  } catch (fallbackError) {
    console.error('Fallback copy method failed:', fallbackError);
  }

  return false;
};