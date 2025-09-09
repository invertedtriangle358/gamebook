const { relayInit } = window.NostrTools;

let scenario = {};
let pubkey = null;
let relays = [
  "wss://relay.damus.io",
  "wss://r.kojila.io",
  "wss://relay-jp.nostr.wirednet.jp"
  "wss://relay.barine.co",
];
let textEl, choicesEl, logEl, loginBtn;

function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  logEl.innerText += `[${timestamp}] ${msg}\n`;
}


async function init() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");
  loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", login);

  await initRelays();   // ✅ 複数リレー初期化
}

  try {
    relay = relayInit("wss://relay.damus.io");
    await relay.connect();
    log("リレー接続完了");
  } catch (e) {
    log("リレー接続失敗: " + e.message);
  }
}

async function loadScenario() {
  try {
    const res = await fetch("scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了");
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message);
  }
}

async function login() {
  if (!window.nostr) {
    alert("NIP-07 拡張が見つかりません（Albyなどを導入してください）");
    return;
  }

  try {
    pubkey = await window.nostr.getPublicKey();
    log("ログイン成功: " + pubkey);

    await loadScenario();
    startGame();
  } catch (e) {
    log("ログイン失敗: " + e.message);
  }
}

function startGame() {
  showScene("start");
}

function showScene(id) {
  const scene = scenario[id];
  if (!scene) {
    log("不明なシーン: " + id);
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


async function sendResult(ending) {
  try {
    const event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({ ending }),
      pubkey
    };

    const signed = await window.nostr.signEvent(event);

    for (const r of relays) {
      r.publish(signed);
      log(`送信完了: ${r.url}`);
    }

    textEl.innerText += `\n\n[${ending} エンディング結果を ${relays.length} リレーに送信しました]`;
  } catch (e) {
    log("送信失敗: " + e.message);
  }
}
