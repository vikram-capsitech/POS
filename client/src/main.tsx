import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux/store";
import "antd/dist/reset.css";

createRoot(document.getElementById("root")!).render(
  <div className="App">
    <React.StrictMode>
      <ReduxProvider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
      </ReduxProvider>
    </React.StrictMode>
  </div>
);
