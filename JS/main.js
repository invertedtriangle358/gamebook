import { loadScenario, showScene } from "./modules/scenario.js";
import { connectRelays, loadMyLogs } from "./modules/relay.js";

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
