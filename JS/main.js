import { loadScenario, showScene } from "./scenario.js";
import { connectRelays, loadMyLogs } from "./relay.js";
import { log } from "./logger.js";

let textEl, choicesEl, logEl, startBtn;

window.addEventListener("DOMContentLoaded", () => {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");
  startBtn = document.getElementById("startBtn");

  // ゲーム開始ボタン
  startBtn.addEventListener("click", async () => {
    startBtn.style.display = "none";  // ボタン非表示
    textEl.style.display = "block";   // ゲームテキスト表示
    choicesEl.style.display = "block"; // 選択肢表示

    await connectRelays(logEl);
    await loadScenario(logEl);
    showScene("start", textEl, choicesEl, logEl);

    // 過去ログ読み込み
    loadMyLogs(logEl);
  });
});
