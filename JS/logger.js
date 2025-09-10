// --- ログ出力ユーティリティ ---
export function log(msg, logEl) {
  if (!logEl) return;
  const t = new Date().toLocaleTimeString();
  logEl.innerText += `[${t}] ${msg}\n`;
}
