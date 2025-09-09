import { relayInit } from "https://cdn.jsdelivr.net/npm/nostr-tools@2.7.2/+esm";

// --- グローバル状態 ---
let scenario = {};
let pubkey = null;
let relay = null;

// DOM要素キャッシュ
let textEl, choicesEl, logEl, loginBtn;

// --- ユーティリティ ---
function log(msg) {
  const timestamp = new Date().toLocaleTimeString();
  logEl.innerText += `[${timestamp}] ${msg}\n`;
}

// --- 初期化処理 ---
async function init() {
  textEl = document.getElementById("text");
  choicesEl = document.getElementById("choices");
  logEl = document.getElementById("log");
  loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", login);

  try {
    relay = relayInit("wss://relay.damus.io");
    await relay.connect();
    log("リレー接続完了");
  } catch (e) {
    log("リレー接続失敗: " + e.message);
  }
}

// --- シナリオロード ---
async function loadScenario() {
  try {
    const res = await fetch("scenario.json");
    scenario = await res.json();
    log("シナリオ読み込み完了");
  } catch (e) {
    log("シナリオ読み込み失敗: " + e.message);
  }
}

// --- Nostrログイン ---
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

// --- ゲーム開始 ---
function startGame() {
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

// --- プレイ結果送信 ---
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
    relay.publish(signed);

    textEl.innerText += `\n\n[${ending} エンディング結果を送信しました]`;
    log("送信完了: " + JSON.stringify(signed));
  } catch (e) {
    log("送信失敗: " + e.message);
  }
}

// --- DOM読み込み後に実行 ---
window.addEventListener("DOMContentLoaded", init);
