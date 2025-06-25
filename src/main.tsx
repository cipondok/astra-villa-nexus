
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('=== MAIN.TSX DEBUG START ===');
console.log('1. main.tsx loading...');
console.log('2. React version:', React.version);
console.log('3. Document ready state:', document.readyState);
console.log('4. Looking for root element...');

const container = document.getElementById("root");
console.log('5. Root element found:', !!container);
console.log('6. Root element details:', container);

if (!container) {
  console.error('❌ ROOT ELEMENT NOT FOUND!');
  console.log('Available elements:', document.body.innerHTML);
  throw new Error("Root element not found");
}

console.log('7. Creating React root...');
const root = createRoot(container);
console.log('8. React root created successfully');

console.log('9. About to render App component...');
console.log('10. App component:', App);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering App:', error);
  console.error('Error stack:', error.stack);
}

console.log('=== MAIN.TSX DEBUG END ===');
