function log(msg, logEl) {
  const t = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${t}] ${msg}`;

  logEl.appendChild(line);

  // 自動スクロール（最新ログが上なので scrollTop を 0 に）
  logEl.scrollTop = 0;
}

