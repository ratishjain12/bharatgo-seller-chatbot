import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Chatbot from "./components/Chatbot";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Chatbot embedded={true} />
    </StrictMode>
  );
}
