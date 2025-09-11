import { loadScenario, showScene } from "./scenario.js";
import { connectRelays, loadMyLogs } from "./relay.js";
import { log } from "./JS/logger.js";

let textEl, choicesEl, logEl;

async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  await connectRelays(logEl);
  await loadScenario(logEl);
  showScene("start", textEl, choicesEl, logEl);
}

window.addEventListener("DOMContentLoaded", async () => {
  await startGame();
  loadMyLogs(logEl);
});
