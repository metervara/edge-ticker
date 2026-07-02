import "./style.css";
import { createEdgeTicker } from "../src/index";

// Minimal usage: bind the ticker to the overlay canvas and let it map the
// page scroll onto the edge path. Everything below is optional configuration.
createEdgeTicker("#edge-ticker", {
  runs: [
    { text: " START ", background: "#111111", fontWeight: 900, punchOut: true },
    { text: "     This is the text that ends here.    ", fill: "#111111" },
    { text: " END ", background: "#ff6b57", fontWeight: 900, punchOut: true },
  ],
});
