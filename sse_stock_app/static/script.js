let lastVersion = -1;

const statusEl = document.getElementById("status");
const versionEl = document.getElementById("version");
const statusInput = document.getElementById("statusInput");
const updateBtn = document.getElementById("updateBtn");
const updateMsg = document.getElementById("updateMsg");

function setUI(status, version) {
  if (typeof status === "string") {
    statusEl.textContent = status;
    statusEl.dataset.status = status;
  }
  if (typeof version === "number") versionEl.textContent = `(version: ${version})`;
}

async function pollForStatus() {
  try {
    const res = await fetch(`/poll-status?last_version=${encodeURIComponent(lastVersion)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (res.status === 200) {
      const data = await res.json();
      if (typeof data.version === "number") lastVersion = data.version;
      if (data.status) setUI(data.status, data.version);
    }
  } catch (e) {
    await new Promise(r => setTimeout(r, 1000));
  } finally {
    setTimeout(pollForStatus, 0);
  }
}

async function updateStatus() {
  updateMsg.textContent = "Mise à jour…";
  try {
    const res = await fetch("/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ status: statusInput.value }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (typeof data.version === "number") lastVersion = data.version;
    if (data.status) setUI(data.status, data.version);
    updateMsg.textContent = "OK";
  } catch (e) {
    updateMsg.textContent = `Erreur: ${e.message}`;
  } finally {
    setTimeout(() => (updateMsg.textContent = ""), 1500);
  }
}

updateBtn.addEventListener("click", updateStatus);
pollForStatus();