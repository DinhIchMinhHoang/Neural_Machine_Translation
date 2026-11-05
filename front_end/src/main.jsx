import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/glass.css";
import "./styles/layout.css";
import "./styles/chat.css";
import "./styles/inspector.css";
import "./styles/select.css";
import "./styles/responsive.css";
import App from "./App.jsx";
import { I18nProvider } from "./lib/i18n.jsx";
import { FlowBg } from "./components/FlowBg.jsx";

createRoot(document.getElementById("root")).render(<I18nProvider><FlowBg/><App/></I18nProvider>);
