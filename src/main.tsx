
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('Main.tsx executing...');

const container = document.getElementById("root");

if (!container) {
  console.error("Root element not found!");
  throw new Error("Root element not found");
}

console.log('Root element found, creating React root...');

const root = createRoot(container);

console.log('Rendering App component...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App render initiated');
