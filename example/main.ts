import "./style.css";
import { createEdgeTicker } from "../src/index";

// Minimal usage: bind the ticker to the overlay canvas and let it map the
// page scroll onto the edge path. Everything below is optional configuration.
createEdgeTicker("#edge-ticker", {
  // exitOverscan is normalized to the strip length and is relative to scroll
  // direction. 0 = the text enters/exits exactly at the ends; a negative value
  // pulls it *inside* so it stays partially visible; a positive value overscans
  // fully out with extra dead travel. Here it fully enters and fully exits.
  // Try { start: -0.3, end: -0.3 } to leave it partially in at both ends.
  exitOverscan: { start: 0, end: 0 },
  // Distortion is texture-driven. Point at any RG map (red = along the ticker,
  // green = across it) to enable it; omit textureUrl for no distortion.
  distortion: { textureUrl: "/textures/distortion-rg.png" },
  runs: [
    { text: " START ", background: "#111111", fontWeight: 900, punchOut: true },
    { text: "     This is the text that ends here.    ", fill: "#111111" },
    { text: " END ", background: "#ff6b57", fontWeight: 900, punchOut: true },
  ],
});
