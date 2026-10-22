const API = "/api/items";
const form = document.querySelector("#itemForm");
const formMessage = document.querySelector("#formMessage");
const itemsList = document.querySelector("#itemsList");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const matchesPanel = document.querySelector("#matchesPanel");
let allItems = [];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}
function pretty(value = "") {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
      else if (body.detail) message = body.detail;
    } catch (_) {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}
function setMessage(message, kind = "") {
  formMessage.textContent = message;
  formMessage.className = `form-message ${kind}`;
}
async function loadItems() {
  itemsList.innerHTML = '<div class="empty-state">Loading reports…</div>';
  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    if (typeFilter.value) params.set("type", typeFilter.value);
    const query = params.toString();
    allItems = await request(`${API}${query ? "?" + query : ""}`);
    renderItems(allItems);
    await loadStats();
  } catch (error) {
    itemsList.innerHTML = `<div class="empty-state">Couldn't load reports. Make sure the Java server is running.<br>${escapeHtml(error.message)}</div>`;
  }
}
function renderItems(items) {
  if (!items.length) {
    itemsList.innerHTML = '<div class="empty-state">No reports found. Be the first to report an item.</div>';
    return;
  }
  itemsList.innerHTML = items.map(item => {
    const typeClass = item.type === "LOST" ? "lost" : "found";
    const statusClass = item.status === "RESOLVED" ? "resolved" : typeClass;
    return `<article class="item-card">
      <div class="item-top">
        <div><h3 class="item-name">${escapeHtml(item.name)}</h3>
          <p class="item-meta">${escapeHtml(item.category)} · ${escapeHtml(item.location)} · ${escapeHtml(item.dateReported || "")}</p></div>
        <span class="pill ${statusClass}">${item.status === "RESOLVED" ? "RESOLVED" : escapeHtml(item.type)}</span>
      </div>
      ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ""}
      <div class="item-footer"><span class="contact">Contact: ${escapeHtml(item.contact)}</span>
        <div class="item-actions">
          ${item.status !== "RESOLVED" ? `<button class="small-button resolve" data-resolve="${item.id}">Mark resolved</button>` : ""}
          <button class="small-button delete" data-delete="${item.id}">Delete</button>
        </div>
      </div>
    </article>`;
  }).join("");
}
async function loadStats() {
  try {
    const items = await request(API);
    document.querySelector("#totalCount").textContent = items.length;
    document.querySelector("#lostCount").textContent = items.filter(i => i.type === "LOST" && i.status === "OPEN").length;
    document.querySelector("#foundCount").textContent = items.filter(i => i.type === "FOUND" && i.status === "OPEN").length;
    const matches = await request(`${API}/matches`);
    document.querySelector("#matchCount").textContent = matches.length;
  } catch (_) {}
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.description = data.description.trim();
  setMessage("Submitting report…");
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    await request(API, { method: "POST", body: JSON.stringify(data) });
    form.reset();
    setMessage("Report submitted successfully.", "success");
    await loadItems();
  } catch (error) {
    setMessage(error.message || "Could not submit report.", "error");
  } finally {
    submit.disabled = false;
  }
});
itemsList.addEventListener("click", async event => {
  const resolveButton = event.target.closest("[data-resolve]");
  const deleteButton = event.target.closest("[data-delete]");
  try {
    if (resolveButton) {
      await request(`${API}/${resolveButton.dataset.resolve}/resolve`, { method: "PATCH" });
      await loadItems();
    }
    if (deleteButton) {
      if (!confirm("Delete this report permanently?")) return;
      await request(`${API}/${deleteButton.dataset.delete}`, { method: "DELETE" });
      await loadItems();
    }
  } catch (error) {
    alert(error.message);
  }
});
let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadItems, 250);
});
typeFilter.addEventListener("change", loadItems);

document.querySelector("#matchesButton").addEventListener("click", showMatches);
document.querySelector("#hideMatches").addEventListener("click", () => { matchesPanel.hidden = true; });
async function showMatches() {
  matchesPanel.hidden = false;
  document.querySelector("#matchesList").innerHTML = '<div class="empty-state">Finding possible matches…</div>';
  matchesPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const matches = await request(`${API}/matches`);
    if (!matches.length) {
      document.querySelector("#matchesList").innerHTML = '<div class="empty-state">No likely matches yet. Add both lost and found reports to compare them.</div>';
      return;
    }
    document.querySelector("#matchesList").innerHTML = matches.map(match => `
      <article class="match-card">
        <div class="score">MATCH SCORE: ${match.score} · ${escapeHtml(match.reason)}</div>
        <div class="match-pair">
          <div class="match-side"><strong>LOST: ${escapeHtml(match.lost.name)}</strong><p>${escapeHtml(match.lost.category)} · ${escapeHtml(match.lost.location)}</p><p>Contact: ${escapeHtml(match.lost.contact)}</p></div>
          <div class="match-side"><strong>FOUND: ${escapeHtml(match.found.name)}</strong><p>${escapeHtml(match.found.category)} · ${escapeHtml(match.found.location)}</p><p>Contact: ${escapeHtml(match.found.contact)}</p></div>
        </div>
      </article>`).join("");
  } catch (error) {
    document.querySelector("#matchesList").innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  }
}
loadItems();
