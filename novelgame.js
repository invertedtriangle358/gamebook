const { relayInit } = window.NostrTools;

let scenario = {};
let relays = []; // ← 接続済みリレーオブジェクトだけを格納
const relayUrls = [
  "wss://relay.damus.io",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://yabu.me",
  "wss://r.kojira.io",
  "wss://relay.barine.co"
];

let textEl, choicesEl, logEl;

// --- ログ出力 ---
function log(msg) {
  const t = new Date().toLocaleTimeString();
  logEl.innerText += `[${t}] ${msg}\n`;
}

// --- シナリオ読み込み ---
async function loadScenario() {
  try {
    const res = await fetch("scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了");
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message);
  }
}

// --- リレー接続 ---
async function connectRelays() {
  for (const url of relayUrls) {
    try {
      const r = relayInit(url);
      await r.connect();
      relays.push(r);
      log(`✅ リレー接続成功: ${url}`);
    } catch (e) {
      log(`❌ リレー接続失敗: ${url} (${e.message})`);
    }
  }
}

// --- ゲーム開始 ---
async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  await connectRelays();
  await loadScenario();
  showScene("start");
}

// --- シーン描画 ---
function showScene(id) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id);
    return;
  }

  textEl.innerText = scene.text;
  choicesEl.innerHTML = "";

  if (scene.end) {
    sendResultSimple(scene.end);
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

// --- クリア結果をNostrに送信 ---
async function sendResultSimple(endingId) {
  if (!window.nostr) {
    log("Nostr拡張がありません。署名送信はスキップします。");
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
      const pub = r.publish(signed);

      pub.on("ok", () => log(`✅ 送信成功: ${r.url}`));
      pub.on("failed", (reason) => log(`❌ 送信失敗: ${r.url} (${reason})`));
    }
  } catch (e) {
    console.error("署名送信失敗:", e);
    log("署名送信失敗: " + e.message);
  }
}

// --- ページ読み込み時に開始 ---
window.addEventListener("DOMContentLoaded", startGame);
