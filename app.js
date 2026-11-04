(function () {
  "use strict";

  var tbody = document.getElementById("manager-rows");
  var countEl = document.getElementById("result-count");
  var searchEl = document.getElementById("search");
  var modelEl = document.getElementById("service-model");
  var sortEl = document.getElementById("sort");
  var resetBtn = document.getElementById("reset-filters");
  var COLS = 8;
  var managers = [];

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tags(list) {
    return (list || []).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("");
  }

  function contactHtml(m) {
    var parts = [];
    if (m.phone && !/^not published/i.test(m.phone)) {
      String(m.phone).split(";").forEach(function (p) {
        var tel = p.replace(/[^\d+]/g, "");
        if (tel.length >= 10) parts.push('<a href="tel:' + esc(tel.slice(0, 10)) + '">' + esc(p.trim()) + "</a>");
      });
    }
    if (m.email && !/^not published/i.test(m.email)) {
      parts.push('<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + "</a>");
    }
    if (!parts.length) parts.push('<span class="muted">See website</span>');
    return parts.join("");
  }

  function matchesModel(m, f) {
    if (!f || f === "all") return true;
    var blob = (m.service_model || []).join(" ").toLowerCase();
    var map = { full: /full-service/, hybrid: /hybrid|partner|online|co-host/, mid: /mid-term/ };
    return map[f] ? map[f].test(blob) : true;
  }

  function matchesSearch(m, q) {
    if (!q) return true;
    return [m.name, m.hq_city, m.areas_served, (m.service_model || []).join(" "), m.management_fee, m.setup_other_fees, m.contract_minimums, m.notes]
      .join(" ").toLowerCase().indexOf(q) !== -1;
  }

  function isLocal(m) { return /,\s*GA/.test(m.hq_city || "") ? 0 : 1; }

  function sortList(list, mode) {
    var c = list.slice();
    c.sort(function (a, b) {
      if (mode === "name-desc") return b.name.localeCompare(a.name);
      if (mode === "local-first" && isLocal(a) !== isLocal(b)) return isLocal(a) - isLocal(b);
      return a.name.localeCompare(b.name);
    });
    return c;
  }

  function render() {
    var q = (searchEl.value || "").trim().toLowerCase();
    var list = sortList(managers.filter(function (m) {
      return matchesSearch(m, q) && matchesModel(m, modelEl.value);
    }), sortEl.value);

    countEl.textContent = list.length + " of " + managers.length + " managers shown · Verified " + (window.MOGUL_VERIFIED || "");

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="' + COLS + '" class="empty">No managers match these filters.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(function (m) {
      return "<tr>" +
        '<td class="name-cell"><strong>' + esc(m.name) + '</strong><div class="hq">' + esc(m.hq_city || "") + "</div>" +
        '<div class="tags">' + tags(m.service_model) + "</div></td>" +
        "<td>" + esc(m.areas_served || "Not published") + "</td>" +
        "<td>" + esc(m.management_fee || "Not published") + "</td>" +
        "<td>" + esc(m.setup_other_fees || "Not published") + "</td>" +
        "<td>" + esc(m.contract_minimums || "Not published") + (m.notes ? '<div class="hq">' + esc(m.notes) + "</div>" : "") + "</td>" +
        '<td class="contact">' + contactHtml(m) + "</td>" +
        '<td><a href="' + esc(m.website) + '" target="_blank" rel="noopener noreferrer">Website</a>' +
        (m.source_url ? '<br><a href="' + esc(m.source_url) + '" target="_blank" rel="noopener noreferrer">Source</a>' : "") + "</td>" +
        '<td class="verified">' + esc(m.verified || "") + "</td>" +
        "</tr>";
    }).join("");
  }

  function boot(data) {
    managers = data.managers || [];
    window.MOGUL_VERIFIED = (data.meta && data.meta.verified_date) || "";
    render();
  }

  searchEl.addEventListener("input", render);
  modelEl.addEventListener("change", render);
  sortEl.addEventListener("change", render);
  resetBtn.addEventListener("click", function () {
    searchEl.value = ""; modelEl.value = "all"; sortEl.value = "local-first"; render();
  });

  if (window.MOGUL_MANAGERS) {
    boot(window.MOGUL_MANAGERS);
  } else {
    fetch("managers.json")
      .then(function (r) { if (!r.ok) throw new Error("Could not load managers.json"); return r.json(); })
      .then(boot)
      .catch(function (err) {
        countEl.textContent = "Could not load manager data.";
        tbody.innerHTML = '<tr><td colspan="' + COLS + '" class="empty">' + esc(err.message) + "</td></tr>";
      });
  }
})();
