import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { ConsentProvider } from "./context/ConsentContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { CookieBanner } from "./components/ui/CookieBanner.jsx";
import { ErrorBoundary } from "./components/ui/ErrorBoundary.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ConsentProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <App />
              <CookieBanner />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ConsentProvider>
  </ErrorBoundary>
);
