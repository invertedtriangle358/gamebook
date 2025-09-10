const { relayInit } = window.NostrTools;

let scenario = {};
let relays = [
    "wss://relay-jp.nostr.wirednet.jp",
    "wss://yabu.me",
    "wss://r.kojira.io",
    "wss://relay.barine.co"
];
let textEl, choicesEl, logEl;

function log(msg) {
  const t = new Date().toLocaleTimeString();
  logEl.innerText += `[${t}] ${msg}\n`;
}

// --- シナリオロード ---
async function loadScenario() {
  const res = await fetch("scenario.json");
  scenario = await res.json();
  log("シナリオ読み込み完了");
}

// --- ゲーム開始 ---
async function startGame() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");

  // 任意のリレーに接続しておく（クリア時に使う）
  const relayUrls = ["wss://relay.damus.io"];
  for (const url of relayUrls) {
    try {
      const r = relayInit(url);
      await r.connect();
      relays.push(r);
      log(`リレー接続成功: ${url}`);
    } catch(e) {
      log(`リレー接続失敗: ${url} (${e.message})`);
    }
  }

  await loadScenario();
  showScene("start");
}

// --- シーン描画 ---
function showScene(id) {
  const scene = scenario[id];
  if (!scene) { log("不明なシーン: "+id); return; }

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

// --- クリア結果をNostrに送信 ---
async function sendResult(endingId) {
  const ending = scenario.endings.find(e => e.id === endingId);
  if (!ending) return;

  const pubkey = await window.nostr.getPublicKey();

  const event = {
    kind: 1,
    created_at: Math.floor(Date.now()/1000),
    tags: [["t", "novelgame"], ...ending.tags],
    content: JSON.stringify({
      id: ending.id,
      title: ending.title,
      description: ending.description
    }),
    pubkey
  };

  const signed = await window.nostr.signEvent(event);
  for (const r of relays) {
    r.publish(signed);
  }
}

// ページ読み込み時にゲーム開始
window.addEventListener("DOMContentLoaded", startGame);
