import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Currently:
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Change to:
root.render(<App />);
