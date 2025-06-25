
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('main.tsx loading...');

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

console.log('Rendering App component...');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
