const { relayInit } = window.NostrTools;

// ===============================
// 設定
// ===============================
const relayUrls = [
  "wss://relay.damus.io",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://yabu.me",
  "wss://r.kojira.io",
  "wss://relay.barine.co"
];

// ===============================
// 変数
// ===============================
let scenario = {};
let relays = [];
let textEl, choicesEl, logEl;

// ===============================
// ユーティリティ
// ===============================
function log(msg, type = "info") {
  const t = new Date().toLocaleTimeString();
  const prefix = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    log: "📜"
  }[type] || "";

  logEl.innerText += `[${t}] ${prefix} ${msg}\n`;
}

// ===============================
// シナリオ関連
// ===============================
async function loadScenario() {
  try {
    const res = await fetch("scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了", "success");
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message, "error");
  }
}

function showScene(id) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id, "error");
    return;
  }

  textEl.innerText = scene.text;
  choicesEl.innerHTML = "";

  if (scene.end) {
    sendResult(scene.end);
    return;
  }

  scene.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.label;
    btn.className = "choice";
    btn.onclick = () => showScene(choice.next);
    choicesEl.appendChild(btn);
  });
}

// ===============================
// リレー関連
// ===============================
async function connectRelays() {
  let successCount = 0;
  let failCount = 0;

  for (const [i, url] of relayUrls.entries()) {
    try {
      const r = relayInit(url);
      await r.connect();
      relays.push(r);
      successCount++;
      log(`(${i + 1}/${relayUrls.length}) 接続成功: ${url}`, "success");
    } catch (e) {
      failCount++;
      log(`(${i + 1}/${relayUrls.length}) 接続失敗: ${url} (${e.message})`, "error");
    }
  }

  log(`📡 接続完了: 成功 ${successCount}/${relayUrls.length}, 失敗 ${failCount}/${relayUrls.length}`);
}

// ===============================
// Nostr送受信
// ===============================
async function sendResult(endingId) {
  if (!window.nostr) {
    log("Nostr拡張がありません。署名送信はスキップします。", "error");
    return;
  }

  try {
    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["t", "novelgame"], ["ending", endingId]],
      content: `ゲーム終了: ${endingId}`
    };

    const signed = await window.nostr.signEvent(event);
    console.log("署名済みイベント:", signed);

    for (const r of relays) {
      r.publish(signed)
        .then(() => log(`送信成功: ${r.url}`, "success"))
        .catch(reason => log(`送信失敗: ${r.url} (${reason})`, "error"));
    }
  } catch (e) {
    console.error("署名送信失敗:", e);
    log("署名送信失敗: " + e.message, "error");
  }
}

async function loadMyLogs() {
  if (!window.nostr) {
    log("Nostr拡張がありません。ログ購読はスキップします。", "error");
    return;
  }

  const myPubkey = await window.nostr.getPublicKey();
  const seenEndings = new Set();

  relays.forEach(r => {
    const sub = r.sub([
      {
        kinds: [1],
        authors: [myPubkey],
        "#t": ["novelgame"],
        limit: 50
      }
    ]);

    sub.on("event", ev => {
      try {
        const endingTag = ev.tags.find(tag => tag[0] === "ending");
        if (!endingTag) return;

        const endingId = endingTag[1];

        if (!seenEndings.has(endingId)) {
          seenEndings.add(endingId);
          log(`クリア済み: ${endingId}`, "log");
        }
      } catch (e) {
        log("ログ解析失敗: " + e.message, "error");
      }
    });

    sub.on("eose", () => {
      log(`ログ読込完了: ${r.url}`, "success");
      sub.unsub();
    });
  });
}

// ===============================
// 初期化
// ===============================
async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  await connectRelays();
  await loadScenario();
  showScene("start");
}

window.addEventListener("DOMContentLoaded", async () => {
  await startGame();
  loadMyLogs();
});
