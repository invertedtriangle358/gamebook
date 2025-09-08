const { relayInit } = window["nostr-tools"];  // グローバルから取得

let scenario = {};
let pubkey = null;
let relay = relayInit("wss://relay.damus.io");
await relay.connect();

const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const logEl = document.getElementById("log");
const loginBtn = document.getElementById("loginBtn");

function log(msg) {
  logEl.innerText += msg + "\n";
}

async function loadScenario() {
  const res = await fetch("scenario.json");
  scenario = await res.json();
  log("シナリオ読み込み完了");
}

async function login() {
  try {
    if (!window.nostr) throw new Error("NIP-07 拡張が見つかりません");
    pubkey = await window.nostr.getPublicKey();
    log("ログイン成功: " + pubkey);
    await loadScenario();
    startGame();
  } catch (e) {
    console.error(e);
    alert("ログイン失敗: " + e.message);
  }
}

function startGame() {
  showScene("start");
}

function showScene(id) {
  const scene = scenario[id];
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
  const event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify({ ending }),
    pubkey
  };
  const signed = await window.nostr.signEvent(event);
  relay.publish(signed);
  textEl.innerText += `\n\n[${ending} エンディング結果を送信しました]`;
  log("送信完了: " + JSON.stringify(signed));
}

loginBtn.addEventListener("click", login);

