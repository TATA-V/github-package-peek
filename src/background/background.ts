const HOT_URL = chrome.runtime.getURL('hot.json');

async function checkReload() {
  try {
    const res = await fetch(`${HOT_URL}?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;

    const { t } = (await res.json()) as { t: number };
    const { __hotT } = await chrome.storage.session.get('__hotT');

    if (__hotT === undefined) {
      await chrome.storage.session.set({ __hotT: t });
    } else if (t !== __hotT) {
      chrome.runtime.reload();
    }
  } catch {
    // hot.json이 없으면 (production) 아무것도 안 함
  }
}

setInterval(checkReload, 1000);
