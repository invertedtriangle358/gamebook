import { loadScenario, showScene } from "./scenario.js";
import { connectRelays, loadMyLogs } from "./relay.js";
import { log } from "./logger.js";

let textEl, choicesEl, logEl, scenario;

// --- エンディング記録 ---
function unlockEnding(endingId) {
  let endings = JSON.parse(localStorage.getItem("endings") || "[]");
  if (!endings.includes(endingId)) {
    endings.push(endingId);
    localStorage.setItem("endings", JSON.stringify(endings));
  }
}

// --- エンディング一覧表示 ---
function showEndingList() {
  textEl.innerText = "エンディング一覧";
  choicesEl.innerHTML = "";

  let endings = JSON.parse(localStorage.getItem("endings") || "[]");

  // scenarioからendを収集
  const allEndings = Object.values(scenario)
    .filter(s => s.end)
    .map(s => s.end);

  allEndings.forEach(endId => {
    const div = document.createElement("div");
    if (endings.includes(endId)) {
      div.innerText = `✅ ${endId}`;
    } else {
      div.innerText = "❌ ???";
    }
    choicesEl.appendChild(div);
  });

  const backBtn = document.createElement("button");
  backBtn.innerText = "タイトルに戻る";
  backBtn.className = "choice";
  backBtn.onclick = showTitle;
  choicesEl.appendChild(backBtn);
}

// --- タイトル画面 ---
function showTitle() {
  textEl.innerText = "Nostrゲームブック";
  choicesEl.innerHTML = "";

  const startBtn = document.createElement("button");
  startBtn.innerText = "ゲームスタート";
  startBtn.className = "choice";
  startBtn.onclick = () => showScene("start", textEl, choicesEl, logEl, scenario, unlockEnding);
  choicesEl.appendChild(startBtn);

  const endingBtn = document.createElement("button");
  endingBtn.innerText = "エンディング一覧";
  endingBtn.className = "choice";
  endingBtn.onclick = showEndingList;
  choicesEl.appendChild(endingBtn);
}

// --- ゲーム開始処理 ---
async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  await connectRelays(logEl);
  scenario = await loadScenario(logEl);

  showTitle(); // ←最初はタイトル画面を表示
}

window.addEventListener("DOMContentLoaded", async () => {
  await startGame();
  loadMyLogs(logEl);
});
