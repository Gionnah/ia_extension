// background.js - Script d'arrière-plan pour l'extension Chrome
import { saveChunk, searchChunks, getAllChunks } from "./db.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log("✅ Extension installée");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "SAVE_CHUNK") {
    (async () => {
      await saveChunk(msg.data);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (msg.type === "SEARCH") {
    (async () => {
      const results = await searchChunks(msg.embedding, 5);
      sendResponse({ success: true, results });
    })();
    return true;
  }

  if (msg.type === "STATS") {
    (async () => {
      const chunks = await getAllChunks();
      const urls = [...new Set(chunks.map(c => c.url))];
      sendResponse({
        chunks: chunks.length,
        pages: urls.length
      });
    })();
    return true;
  }
});
