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

    const sendBtn = document.createElement("button");
    sendBtn.innerText = "結果を送信";
    sendBtn.className = "choice";
    sendBtn.onclick = () => {
      sendResultSimple(scene.end, logEl);
      unlockEnding(scene.end); // ←ここで保存
    };

    const restartBtn = document.createElement("button");
    restartBtn.innerText = "タイトルに戻る";
    restartBtn.className = "choice";
    restartBtn.onclick = () => showTitle(textEl, choicesEl, logEl, scenario, unlockEnding);

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
    btn.onclick = () => showScene(choice.next, textEl, choicesEl, logEl, scenario, unlockEnding);
    choicesEl.appendChild(btn);
  });
}
