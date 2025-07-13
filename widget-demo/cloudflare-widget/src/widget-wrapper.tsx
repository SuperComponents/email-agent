import "./styles.css";
import { createRoot, type Root } from "react-dom/client";
import App from "./app";
import { Providers } from "@/providers";

// Widget configuration passed from parent
interface WidgetConfig {
  apiUrl?: string;
  appId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  theme?: "dark" | "light";
  position?: "bottom-right" | "bottom-left";
}

declare global {
  interface Window {
    widgetConfig?: WidgetConfig;
    __chatWidgetReactRoot?: Root;
  }
}

// Webpack HMR types
declare const module: {
  hot?: {
    accept(path: string, callback: () => void): void;
    dispose(callback: () => void): void;
  };
};

// Initialize the widget
function initWidget() {
  const config = window.widgetConfig || {};
  
  // Create root element if it doesn't exist
  let root = document.getElementById("chat-widget-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "chat-widget-root";
    document.body.appendChild(root);
  }

  // Apply widget-specific styles
  document.documentElement.style.cssText = `
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  `;
  document.body.style.cssText = `
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  `;

  // Set theme if provided
  if (config.theme) {
    document.documentElement.classList.add(config.theme);
  }

  try {
    // Create (or reuse) React root
    const reactRoot =
      window.__chatWidgetReactRoot ??
      (window.__chatWidgetReactRoot = createRoot(root));

    // Helper function to render the app
    const renderApp = () => {
      // Get the current version of App component
      const NextApp = require("./app").default;
      reactRoot.render(
        <Providers>
          <div className="bg-neutral-50 text-base text-neutral-900 antialiased transition-colors selection:bg-blue-700 selection:text-white dark:bg-neutral-950 dark:text-neutral-100 h-full w-full">
            <NextApp />
          </div>
        </Providers>
      );
    };

    renderApp(); // Initial mount

    // HMR wiring
    if (module.hot) {
      module.hot.accept("./app", renderApp);

      module.hot.dispose(() => {
        if (window.__chatWidgetReactRoot) {
          window.__chatWidgetReactRoot.unmount();
          delete window.__chatWidgetReactRoot;
        }
      });
    }

    // Notify parent that widget is ready
    setTimeout(() => {
      window.parent.postMessage({ type: "WIDGET_READY" }, "*");
    }, 100);
  } catch (error) {
    console.error("Error rendering widget:", error);
    root.innerHTML = `<div style="color: red; padding: 20px;">Error loading widget: ${error.message}</div>`;
  }
}

// Handle messages from parent
window.addEventListener("message", (event) => {
  switch (event.data.type) {
    case "UPDATE_CONFIG":
      window.widgetConfig = { ...window.widgetConfig, ...event.data.config };
      break;
    case "DESTROY":
      const root = document.getElementById("chat-widget-root");
      if (root) {
        root.remove();
      }
      break;
  }
});

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
} 