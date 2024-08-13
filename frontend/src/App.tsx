import { useEffect } from "react";
import zoomSdk from "@zoom/appssdk";
import { notification } from "antd";
import AppRouter from "./components/AppRouter/AppRouter";

const base64URL = (s: ArrayBuffer) => {
  const string = btoa(String.fromCharCode(...new Uint8Array(s)));
  return string.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

function App() {
  const isZoomApp = true; // assuming that all the time we are using this app through Zoom app.
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64URL(array.buffer);
  };

  const generateCodeChallenge = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return base64URL(digest);
  };

  const getToken = async (params: any) => {
    try {
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching token:", error);
      notification.error({
        message: "Error fetching token. Please try again.",
      });
      throw error;
    }
  };

  const getMe = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      notification.error({
        message: "Error fetching user data. Please try again.",
      });
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = base64URL(
          window.crypto.getRandomValues(new Uint8Array(16)).buffer
        );

        const result = await zoomSdk.config({
          capabilities: [
            "getRunningContext",
            "getSupportedJsApis",
            "openUrl",
            "authorize",
            "onAuthorized",
          ],
        });

        zoomSdk.addEventListener("onAuthorized", async (event) => {
          const params = {
            code: event.code,
            state: event.state,
            verifier: codeVerifier,
          };

          const tokenResponse = await getToken(params);
          if (tokenResponse) {
            await getMe();
          }
        });

        zoomSdk.authorize({ state, codeChallenge }).catch((error) => {
          notification.error({
            message:
              "Some error occurred during Zoom SDK authorize. Please restart the app.",
          });
        });
      } catch (error) {
        console.error("Error initializing authentication:", error);
      }
    };

    initializeAuth();
  }, []);

  return (
    <div className="App">
      {isZoomApp && (
        <div className="zoom-message">
          <p>Finally it worked !!!!!</p>
        </div>
      )}
      <AppRouter />
    </div>
  );
}

export default App;
