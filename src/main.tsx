
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

import { ThemeContextProvider } from "./theme/ThemeContext";

import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById("root")!).render(
  <ThemeContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeContextProvider>
);
