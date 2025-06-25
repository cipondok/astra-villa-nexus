
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 DEPLOYMENT CHECK: main.tsx loading...');
console.log('🚀 DEPLOYMENT CHECK: Timestamp:', new Date().toISOString());

const container = document.getElementById("root");

if (!container) {
  console.error('❌ ROOT ELEMENT NOT FOUND!');
  document.body.innerHTML = '<div style="padding: 20px; background: red; color: white; font-size: 20px;">ERROR: Root element not found!</div>';
  throw new Error("Root element not found");
}

console.log('🚀 DEPLOYMENT CHECK: Root element found, creating React app...');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('🚀 DEPLOYMENT CHECK: React app rendered successfully!');
