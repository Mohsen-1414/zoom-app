import React, { useEffect } from "react";
import zoomSdk from "@zoom/appssdk";
import ReactDOM from "react-dom";
import App from "./App";
import { ConfigProvider } from "antd";

const ZoomInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const initializeZoomSdk = async () => {
      try {
        await zoomSdk.config({
          capabilities: [
            "getRunningContext",
            "getSupportedJsApis",
            "openUrl",
            "authorize",
            "onAuthorized",
          ],
        });
      } catch (error) {
        console.error("Error initializing Zoom SDK:", error);
      }
    };

    initializeZoomSdk();
  }, []);

  return <>{children}</>;
};

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider>
      <ZoomInitializer>
        <App />
      </ZoomInitializer>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
