import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./../service-worker.js")
            .then((registration) => {
                console.log("Service Worker registered! Scope: ", registration.scope);
            })
            .catch((err) => {
                console.log("Service Worker registration failed: ", err);
            });
    });
}
