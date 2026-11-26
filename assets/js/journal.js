(() => {
  "use strict";
  const root = document.querySelector("[data-journal]");
  if (!root) return;
  const entries = Array.from(root.querySelectorAll("[data-entry]"));
  const search = root.querySelector("#entry-search");
  const filters = Array.from(root.querySelectorAll("[data-filter]"));
  const more = root.querySelector("[data-more]");
  const count = root.querySelector("[data-count]");
  const empty = root.querySelector("[data-empty]");
  const params = new URLSearchParams(location.search);
  let topic = filters.some(button => button.dataset.filter === params.get("topic")) ? params.get("topic") : "all";
  let limit = 6;
  search.value = params.get("q") || "";
  root.querySelector("[data-controls]").hidden = false;
  count.hidden = false;
  function render(updateURL = true) {
    const term = search.value.trim().toLocaleLowerCase();
    const matching = entries.filter(entry => (topic === "all" || entry.dataset.topic === topic) && entry.dataset.search.includes(term));
    const shown = new Set(matching.slice(0, limit));
    entries.forEach(entry => { entry.hidden = !shown.has(entry); });
    filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === topic)));
    count.textContent = matching.length === 0 ? "No matching entries" : `Showing ${Math.min(limit, matching.length)} of ${matching.length} entries`;
    more.hidden = matching.length <= limit;
    empty.hidden = matching.length !== 0;
    if (updateURL) {
      const url = new URL(location.href);
      if (topic === "all") url.searchParams.delete("topic"); else url.searchParams.set("topic", topic);
      if (term) url.searchParams.set("q", search.value.trim()); else url.searchParams.delete("q");
      history.replaceState(null, "", url);
    }
  }
  filters.forEach(button => button.addEventListener("click", () => { topic = button.dataset.filter; limit = 6; render(); }));
  search.addEventListener("input", () => { limit = 6; render(); });
  more.addEventListener("click", () => {
    const previous = entries.filter(entry => !entry.hidden);
    limit += 6; render(false);
    const firstNew = entries.find(entry => !entry.hidden && !previous.includes(entry));
    if (firstNew) firstNew.querySelector("h2 a, h3 a").focus();
  });
  root.querySelector("[data-clear]").addEventListener("click", () => { topic = "all"; search.value = ""; limit = 6; render(); search.focus(); });
  render(false);
})();
