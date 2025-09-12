import { log } from "./logger.js";
import { sendResultSimple } from "./relay.js";

// シナリオを保持する変数
let scenario = {};

// --- シナリオ読み込み ---
export async function loadScenario(logEl) {
  try {
    const res = await fetch("./scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了", logEl);
    return scenario; // ← main.js で使えるように return
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message, logEl);
    return {};
  }
}

// --- シーン描画 ---
export function showScene(id, textEl, choicesEl, logEl, scenario, unlockEnding) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id, logEl);
    return;
  }

  textEl.innerText = scene.text;
  choicesEl.innerHTML = "";

  if (scene.end) {
    const endChoices = document.createElement("div");
    endChoices.className = "end-choices";

    // 「結果を送信」ボタン
    const sendBtn = document.createElement("button");
    sendBtn.innerText = "結果を送信";
    sendBtn.className = "choice";
    sendBtn.onclick = () => {
      sendResultSimple(scene.end, logEl);
      unlockEnding(scene.end); // ← エンディング保存
    };

    // 「タイトルに戻る」ボタン
    const restartBtn = document.createElement("button");
    restartBtn.innerText = "タイトルに戻る";
    restartBtn.className = "choice";
    restartBtn.onclick = () =>
      showTitle(textEl, choicesEl, logEl, scenario, unlockEnding);

    endChoices.appendChild(sendBtn);
    endChoices.appendChild(restartBtn);
    choicesEl.appendChild(endChoices);
    return;
  }

  // 通常の選択肢
  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.className = "choice";
    btn.onclick = () =>
      showScene(choice.next, textEl, choicesEl, logEl, scenario, unlockEnding);
    choicesEl.appendChild(btn);
  });
}
