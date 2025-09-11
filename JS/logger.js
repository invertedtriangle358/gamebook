export function log(msg, logEl) {
  const t = new Date().toLocaleTimeString();
  const line = document.createElement("div");

  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = `[${t}] `;

  const msgSpan = document.createElement("span");
  msgSpan.innerHTML = msg;

  line.appendChild(timeSpan);
  line.appendChild(msgSpan);

  // 新しい行を先頭に追加
  logEl.prepend(line);

  // 先頭にスクロール
  logEl.scrollTop = 0;
}
