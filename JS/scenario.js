import { log } from "./logger.js";
import { sendResultSimple } from "./relay.js"; // relay.jsからインポート

let scenario = {}; // シナリオデータ保持用

// --- シナリオ読み込み ---
export async function loadScenario(logEl) {
  try {
    const res = await fetch("./JS/scenario.json"); // パス注意
    scenario = await res.json();
    log("シナリオ読み込み完了", logEl);
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message, logEl);
  }
}

// --- シーン描画 ---
export function showScene(id, textEl, choicesEl, logEl) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id, logEl);
    return;
  }

  textEl.innerText = scene.text;
  choicesEl.innerHTML = "";

  if (scene.end) {
    // 横並び用のコンテナ
    const endChoices = document.createElement("div");
    endChoices.className = "end-choices";

    // --- 「結果を送信」ボタン ---
    const sendBtn = document.createElement("button");
    sendBtn.innerText = "結果を送信";
    sendBtn.className = "choice";
    sendBtn.onclick = () => sendResultSimple(scene.end, logEl);

    // --- 「最初に戻る」ボタン ---
    const restartBtn = document.createElement("button");
    restartBtn.innerText = "最初に戻る";
    restartBtn.className = "choice";
    restartBtn.onclick = () => showScene("start", textEl, choicesEl, logEl);

    endChoices.appendChild(sendBtn);
    endChoices.appendChild(restartBtn);

    choicesEl.appendChild(endChoices);
    return;
  }

  // 通常の選択肢（縦並び）
  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.className = "choice";
    btn.onclick = () => showScene(choice.next, textEl, choicesEl, logEl);
    choicesEl.appendChild(btn);
  });
}
