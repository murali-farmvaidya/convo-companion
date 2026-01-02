import React from "react";
import { createRoot, Root } from "react-dom/client";
import ChatWidget from "./components/chat/ChatWidget";
import "./index.css";

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Global window type extension
declare global {
  interface Window {
    FarmVaidyaChatWidget?: {
      init: (containerId?: string, options?: any) => void;
    };
    __FV_WIDGET_ROOT__?: Root;
  }
}

// Create a global function to initialize the widget
(window as any).FarmVaidyaChatWidget = {
  init: (containerId: string = 'farm-vaidya-chat-widget', options: any = {}) => {
    let container = document.getElementById(containerId);
    
    if (!container) {
      // Create container if it doesn't exist
      container = document.createElement('div');
      container.id = containerId;
      container.style.all = 'initial';
      document.body.appendChild(container);
    }

    // Reuse existing root or create new one
    let root = (window as any).__FV_WIDGET_ROOT__;
    if (!root) {
      root = createRoot(container);
      (window as any).__FV_WIDGET_ROOT__ = root;
    }
    
    root.render(
      <React.StrictMode>
        <ChatWidget
          apiBaseUrl={options.apiBaseUrl || DEFAULT_API_BASE_URL}
          floating={options.floating !== undefined ? options.floating : true}
          theme={options.theme || 'light'}
          title={options.title || 'Chat Support'}
        />
      </React.StrictMode>
    );
  }
};


