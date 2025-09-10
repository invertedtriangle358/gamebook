import { log } from "./logger.js";
import { sendResultSimple } from "./relay.js";

let scenario = {};

export async function loadScenario(logEl) {
  try {
    const res = await fetch("scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了", logEl);
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message, logEl);
  }
}

export function showScene(id, textEl, choicesEl, logEl) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id, logEl);
    return;
  }

  textEl.innerText = scene.text;
  choicesEl.innerHTML = "";

  if (scene.end) {
    sendResultSimple(scene.end, logEl);
    return;
  }

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.className = "choice";
    btn.onclick = () => showScene(choice.next, textEl, choicesEl, logEl);
    choicesEl.appendChild(btn);
  });
}
