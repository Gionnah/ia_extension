// sidepanel.js
import { pipeline } from "./lib/transformers.min.js";

let embedder = null;

async function loadModel() {
  embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { quantized: true }
  );
  console.log("✅ Modèle IA chargé");
}

await loadModel();

async function embed(text) {
  const out = await embedder(text.slice(0, 500), {
    pooling: "mean",
    normalize: true
  });
  return Array.from(out.data);
}

document.getElementById("cache").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      url: location.href,
      title: document.title,
      text: document.body.innerText.slice(0, 20000)
    })
  });

  const embedding = await embed(result.text);

  chrome.runtime.sendMessage({
    type: "SAVE_CHUNK",
    data: {
      ...result,
      embedding,
      timestamp: Date.now()
    }
  });

  alert("✅ Page mise en cache");
};

document.getElementById("ask").onclick = async () => {
  const q = document.getElementById("question").value;
  const qEmbedding = await embed(q);

  chrome.runtime.sendMessage(
    { type: "SEARCH", embedding: qEmbedding },
    res => {
      document.getElementById("output").textContent =
        res.results.map(r => r.title).join("\n");
    }
  );
};
