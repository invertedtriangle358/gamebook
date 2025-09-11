// logger.js
export function log(msg, logEl) {
  const t = new Date().toLocaleTimeString();
  const line = document.createElement("div");

  const timeSpan = document.createElement("span");
  timeSpan.className = "log-time";
  timeSpan.textContent = `[${t}] `;

  const msgSpan = document.createElement("span");

  // 成功・失敗の判定
  if (msg.startsWith("✅")) {
    msgSpan.className = "log-success";
  } else if (msg.startsWith("❌")) {
    msgSpan.className = "log-fail";
  }

  // リレー名だけ青くする
  msgSpan.innerHTML = msg.replace(/(wss:\/\/[^\s]+)/g, `<span class="log-relay">$1</span>`);

  line.appendChild(timeSpan);
  line.appendChild(msgSpan);
  logEl.appendChild(line);

  // 最新ログが上に来る場合のスクロール
  logEl.scrollTop = 0;
}

