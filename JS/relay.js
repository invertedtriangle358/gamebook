import { log } from "./logger.js";
const { relayInit } = window.NostrTools;

let relays = [];
const relayUrls = [
  "wss://relay.damus.io",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://yabu.me",
  "wss://r.kojira.io",
  "wss://relay.barine.co"
];

// --- リレー接続 ---
export async function connectRelays(logEl) {
  let successCount = 0;
  let failCount = 0;
  const total = relayUrls.length;

for (const [i, url] of relayUrls.entries()) {
  try {
    const r = relayInit(url);
    await r.connect();
    relays.push(r);
    successCount++;
    log(`✅ (${i + 1}/${total}) 接続成功: ${url}`, logEl);
  } catch (e) {
    failCount++;
    // 安全に文字列化
    const errMsg = (e && e.message) ? e.message : String(e);
    log(`❌ (${i + 1}/${total}) 接続失敗: ${url} (${errMsg})`, logEl);
  }
}


  log(`📡 接続完了: 成功 ${successCount}/${total}, 失敗 ${failCount}/${total}`, logEl);
}

// --- クリア結果送信 ---
export async function sendResultSimple(endingId, logEl) {
  if (!window.nostr) {
    log("Nostr拡張がありません。署名送信はスキップします。", logEl);
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

    for (const r of relays) {
      r.publish(signed)
        .then(() => log(`✅ 送信成功: ${r.url}`, logEl))
        .catch((reason) => log(`❌ 送信失敗: ${r.url} (${reason})`, logEl));
    }
  } catch (e) {
    log("署名送信失敗: " + e.message, logEl);
  }
}

// --- プレイログ読込（重複排除） ---
export async function loadMyLogs(logEl) {
  if (!window.nostr) {
    log("Nostr拡張がありません。ログ購読はスキップします。", logEl);
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
      const endingTag = ev.tags.find(tag => tag[0] === "ending");
      if (!endingTag) return;
      const endingId = endingTag[1];

      if (!seenEndings.has(endingId)) {
        seenEndings.add(endingId);
        log(`📜 クリア済み: ${endingId}`, logEl);
      }
    });

    sub.on("eose", () => {
      log(`✅ ログ読込完了: ${r.url}`, logEl);
      sub.unsub();
    });
  });
}
