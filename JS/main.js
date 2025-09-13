import { loadScenario, showScene } from "./scenario.js";
import { connectRelays, loadMyLogs } from "./relay.js";
import { log } from "./logger.js";

let textEl, choicesEl, logEl, scenario;

// --- エンディング保存 ---
function unlockEnding(endingId) {
  const endings = JSON.parse(localStorage.getItem("endings") || "[]");
  if (!endings.includes(endingId)) {
    endings.push(endingId);
    localStorage.setItem("endings", JSON.stringify(endings));
    log(`⭐ 新しいエンディングを発見: ${endingId}`, logEl);
  }
}

// --- エンディング一覧 ---
function showEndingList() {
  textEl.innerText = "エンディング一覧";
  choicesEl.innerHTML = "";

  const unlocked = JSON.parse(localStorage.getItem("endings") || "[]");
  const allEndings = Object.values(scenario)
    .filter(s => s.end)
    .map(s => s.end);

  allEndings.forEach(endId => {
    const div = document.createElement("div");
    div.innerText = unlocked.includes(endId) ? `✅ ${endId}` : "❌ ???";
    choicesEl.appendChild(div);
  });

  addButton("タイトルに戻る", showTitle);
}

// --- タイトル画面 ---
function showTitle() {
  textEl.innerText = "Nostrゲームブック";
  choicesEl.innerHTML = "";
  
addButton("ゲームスタート", () => {
  console.log("スタート押した");
  showScene("start", textEl, choicesEl, logEl, scenario, unlockEnding, showTitle);
});

  addButton("エンディング一覧", showEndingList);
}

// --- 共通ボタン生成 ---
function addButton(label, onClick) {
  const btn = document.createElement("button");
  btn.innerText = label;
  btn.className = "choice";
  btn.onclick = onClick;
  choicesEl.appendChild(btn);
}

// --- ゲーム開始 ---
async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  await connectRelays(logEl);
  scenario = await loadScenario(logEl);

  showTitle();
}

 window.addEventListener("DOMContentLoaded", async () => {
   await startGame();
   loadMyLogs(logEl);
 });
