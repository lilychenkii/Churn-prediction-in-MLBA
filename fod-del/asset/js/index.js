// ⚙️ Backend API base (Flask)
  const API_BASE = "http://127.0.0.1:5000";

  const $ = id => document.getElementById(id);
  const health = $("health");
  const modelSelect = $("modelSelect");
  const pretty = $("pretty");
  const jsonBox = $("json");
  const btnPredict = $("btnPredict");
  const btnClear = $("btnClear");

  function num(v) {
    if (v === "" || v == null) return null;
    const x = Number(v);
    return isNaN(x) ? null : x;
  }

  function getPayload() {
    const p = {};
    p.gender = $("gender").value;
    p.num_orders = num($("num_orders").value);
    p.avg_order_value = num($("avg_order_value").value);
    p.cancel_rate = num($("cancel_rate").value);
    p.voucher_usage_rate = num($("voucher_usage_rate").value);
    p.avg_rating = num($("avg_rating").value);
    p.loyalty_tier = $("loyalty_tier").value;
    p.age = num($("age").value);
    p.city_zone = $("city_zone").value;
    p.inactive_days = num($("inactive_days").value);
    return p;
  }

  function validate(p) {
    const errs = [];
    if (p.cancel_rate != null && (p.cancel_rate < 0 || p.cancel_rate > 1))
      errs.push("cancel_rate must be in [0,1]");
    if (p.voucher_usage_rate != null && (p.voucher_usage_rate < 0 || p.voucher_usage_rate > 1))
      errs.push("voucher_usage_rate must be in [0,1]");
    if (p.avg_rating != null && (p.avg_rating < 0 || p.avg_rating > 5))
      errs.push("avg_rating must be in [0,5]");
    if (p.num_orders != null && p.num_orders < 0)
      errs.push("num_orders ≥ 0");
    if (p.avg_order_value != null && p.avg_order_value < 0)
      errs.push("avg_order_value ≥ 0");
    if (p.age != null && p.age < 0)
      errs.push("age ≥ 0");
    if (p.inactive_days != null && p.inactive_days < 0)
      errs.push("inactive_days ≥ 0");
    return errs;
  }

  function riskBadge(bucket, prob) {
    const pct = (prob * 100).toFixed(2) + "%";
    if (bucket === "high") return `<span class="badge risk-high">High • ${pct}</span>`;
    if (bucket === "medium") return `<span class="badge risk-med">Medium • ${pct}</span>`;
    return `<span class="badge risk-low">Low • ${pct}</span>`;
  }

  // ===== Models & Health =====
  async function refreshModels() {
    try {
      const r = await fetch(`${API_BASE}/models`);
      if (!r.ok) return;
      const j = await r.json();
      if (Array.isArray(j.available_models)) {
        modelSelect.innerHTML = `<option value="">(Best in zip)</option>`;
        j.available_models.forEach(m => {
          if (m === "kmeans") return; // không cho chọn kmeans ở predict
          const opt = document.createElement("option");
          opt.value = m;
          opt.textContent = m;
          modelSelect.appendChild(opt);
        });
        if (j.best_in_zip && modelSelect.querySelector(`option[value="${j.best_in_zip}"]`)) {
          modelSelect.value = j.best_in_zip;
        }
      }
    } catch (e) {
      console.warn("refreshModels error:", e);
    }
  }

  async function refreshHealth() {
    try {
      const m = modelSelect.value;
      const r = await fetch(
        m ? `${API_BASE}/health?model=${encodeURIComponent(m)}` 
          : `${API_BASE}/health`
      );
      const j = await r.json();
      if (j.status === "ok") {
        health.innerHTML = `<span class="ok">✓ Backend OK</span> • Model: <b>${j.model_name || "(best)"}</b> • File: ${j.loaded_from || "(zip)"}`;
      } else {
        health.innerHTML = `<span class="err">✗ Backend Error:</span> ${j.message || "unknown"}`;
      }
    } catch (e) {
      health.innerHTML = `<span class="err">✗ Cannot connect to backend:</span> ${e.message}`;
    }
  }

  modelSelect.addEventListener("change", refreshHealth);

  // ===== Predict =====
  btnPredict.addEventListener("click", async () => {
    const payload = getPayload();
    const errs = validate(payload);
    if (errs.length) {
      pretty.innerHTML = `<span class="err">Input Error:</span> ${errs.join("; ")}`;
      jsonBox.textContent = "";
      return;
    }
    pretty.textContent = "Predicting…";
    btnPredict.disabled = true;

    try {
      const m = modelSelect.value;
      const url = m
        ? `${API_BASE}/predict?model=${encodeURIComponent(m)}`
        : `${API_BASE}/predict`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      jsonBox.textContent = text;

      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (data && typeof data === "object" && "probability" in data) {
        const prob = Number(data.probability);
        const bucket = (data.risk_bucket || "").toLowerCase();
        const badge = riskBadge(bucket, prob);
        const label = data.prediction ? "WILL CHURN (1)" : "WILL NOT CHURN (0)";

        let confText = "";
        if (data.confidence_level) {
          const map = {
            very_high: "very confident",
            high: "quite confident",
            medium: "uncertain",
            low: "not confident"
          };
          const lvl = map[data.confidence_level] || data.confidence_level;
          let scoreStr = "";
          if (typeof data.confidence_score === "number") {
            scoreStr = ` (${(data.confidence_score * 100).toFixed(1)}% confidence)`;
          }
          confText = ` • Confidence: <b>${lvl}</b>${scoreStr}`;
        }

        pretty.innerHTML =
          `${badge} • Prediction: <b>${label}</b>${confText}` +
          (data.loaded_from ? ` • <span class="muted">${data.loaded_from}</span>` : "");
      } else if (data && data.error) {
        pretty.innerHTML = `<span class="err">Error:</span> ${data.error}`;
      } else {
        pretty.innerHTML = `<span class="err">Could not parse JSON response.</span>`;
      }
    } catch (e) {
      pretty.innerHTML = `<span class="err">Error:</span> ${e.message}`;
      jsonBox.textContent = "";
    } finally {
      btnPredict.disabled = false;
    }
  });

  btnClear.addEventListener("click", () => {
    ["num_orders", "avg_order_value", "cancel_rate", "voucher_usage_rate", "avg_rating", "age", "inactive_days"]
      .forEach(id => $(id).value = "");
    pretty.textContent = "Data cleared.";
    jsonBox.textContent = "";
  });

  // ===== Tabs =====
  function showTab(ev, id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    ev.target.classList.add("active");
  }

  // ===== KMeans – churn rate bar chart =====
  let kChart = null;
  async function loadKMeans() {
    try {
      const res = await fetch(`${API_BASE}/kmeans_clusters`);
      const j = await res.json();
      if (j.error) {
        alert("KMeans Error: " + j.error);
        return;
      }
      const clusters = j.clusters || [];

      // Table
      const tbody = document.querySelector("#clusterSummaryTable tbody");
      tbody.innerHTML = "";
      clusters.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.cluster}</td>
          <td>${(c.churn_rate * 100).toFixed(2)}%</td>
          <td>${c.churn_count}</td>
          <td>${c.total_customers}</td>
        `;
        tbody.appendChild(tr);
      });

      // Bar chart
      const labels = clusters.map(c => `Cluster ${c.cluster}`);
      const rates = clusters.map(c => c.churn_rate * 100);

      if (kChart) kChart.destroy();
      const ctx = document.getElementById("chartKMeans").getContext("2d");
      kChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Churn Rate (%)",
            data: rates,
            backgroundColor: "#4fd1c5"
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Churn Rate (%)" },
              ticks: { callback: v => v + "%" }
            },
            x: {
              title: { display: true, text: "Cluster" }
            }
          }
        }
      });
    } catch (e) {
      alert("Error loading KMeans: " + e.message);
    }
  }

  // ===== CLUSTER LIST (TAB 3) =====
  let clusterRows = [];
  let clusterColumns = [];

  async function loadClusterList() {
    try {
      const res = await fetch(`${API_BASE}/kmeans_cluster_rows`);
      const j = await res.json();
      if (j.error) {
        alert("Error loading list: " + j.error);
        return;
      }
      clusterRows = j.rows || [];
      clusterColumns = j.columns || [];

      // render header
      const thead = $("clusterListHead");
      thead.innerHTML = "";
      const trHead = document.createElement("tr");
      clusterColumns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);

      // fill dropdown cluster
      const select = $("clusterFilter");
      select.innerHTML = '<option value="">All</option>';
      const ids = [...new Set(clusterRows.map(r => r.cluster))].sort((a, b) => a - b);
      ids.forEach(cid => {
        const opt = document.createElement("option");
        opt.value = cid;
        opt.textContent = "Cluster " + cid;
        select.appendChild(opt);
      });

      renderClusterTable();
    } catch (e) {
      alert("Error loading list: " + e.message);
    }
  }

  function renderClusterTable() {
    const tbody = $("clusterListBody");
    tbody.innerHTML = "";
    if (!clusterRows.length) return;

    const filter = $("clusterFilter").value;
    const rows = clusterRows.filter(r => !filter || String(r.cluster) === filter);

    rows.forEach(r => {
      const tr = document.createElement("tr");
      clusterColumns.forEach(col => {
        const td = document.createElement("td");
        let val = r[col];

        if (col === "Churn_food") {
          val = (val === 1 || val === "1" || val === true) ? "Churned" : "Active";
        }
        td.textContent = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const filter = $("clusterFilter");
    if (filter) {
      filter.addEventListener("change", renderClusterTable);
    }
  });

  // ===== WHAT-IF ANALYTICS =====
  async function runWhatIf() {
    const base = {
      num_orders: num($("wh_num_orders").value),
      avg_order_value: num($("wh_avg_order_value").value),
      loyalty_tier: $("wh_loyalty_tier").value
    };

    const before = num($("wh_resp_before").value);
    const after = num($("wh_resp_after").value);
    const featureName = "support_response_time_hours";

    const box = $("whatIfPretty");
    const jsonBox = $("whatIfJson");
    box.textContent = "Running simulation…";
    jsonBox.textContent = "";

    try {
      const m = modelSelect.value;
      const url = m
        ? `${API_BASE}/what_if?model=${encodeURIComponent(m)}`
        : `${API_BASE}/what_if`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: featureName,
          base: base,
          value_before: before,
          value_after: after
        })
      });

      const text = await res.text();
      jsonBox.textContent = text;

      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (data.error) {
        box.innerHTML = `<span class="err">Error:</span> ${data.error}`;
        return;
      }

      const pb = Number(data.prob_before);
      const pa = Number(data.prob_after);
      const delta = Number(data.delta);

      const pctBefore = (pb * 100).toFixed(2) + "%";
      const pctAfter = (pa * 100).toFixed(2) + "%";
      const diff = (delta * 100).toFixed(2);

      let trend;
      if (delta < 0) trend = "📉 DECREASED";
      else if (delta > 0) trend = "📈 INCREASED";
      else trend = "➖ NO CHANGE";

      const sign = delta >= 0 ? "+" : "";

      box.innerHTML = `
        ${trend}: churn probability changes from <b>${pctBefore}</b> to <b>${pctAfter}</b>
        (difference ${sign}${diff} percentage points)
        when reducing support response time from <b>${before}h</b> to <b>${after}h</b>.
      `;
    } catch (e) {
      box.innerHTML = `<span class="err">Error:</span> ${e.message}`;
    }
  }

  // ===== TOP N HIGH-RISK CUSTOMERS =====
  async function loadTopRisk() {
    try {
      const n = Number($("topNInput").value) || 20;
      const m = modelSelect.value;
      const bucket = ($("riskBucketSelect")?.value || "high").toLowerCase();
      let url = `${API_BASE}/top_risk_customers?top_n=${encodeURIComponent(n)}&bucket=${encodeURIComponent(bucket)}`;
      if (m) url += `&model=${encodeURIComponent(m)}`;


      const res = await fetch(url);
      const j = await res.json();
      if (j.error) {
        alert("Error Top N: " + j.error);
        return;
      }

      const cols = j.columns || [];
      const rows = j.rows || [];

      const thead = document.querySelector("#topRiskTable thead");
      const tbody = document.querySelector("#topRiskTable tbody");
      thead.innerHTML = "";
      tbody.innerHTML = "";

      // header
      const trHead = document.createElement("tr");
      cols.forEach(c => {
        const th = document.createElement("th");
        th.textContent = c;
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);

      // body
      rows.forEach(r => {
        const tr = document.createElement("tr");
        cols.forEach(c => {
          const td = document.createElement("td");
          let val = r[c];

          if (c === "churn_proba" && typeof val === "number") {
            val = (val * 100).toFixed(2) + "%";
          }
          if (c === "risk_bucket") {
            if (val === "high") val = "High";
            else if (val === "medium") val = "Medium";
            else val = "Low";
          }
          if (c === "prediction") {
            val = val ? "Will Churn" : "Will Stay";
          }

          td.textContent = val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

    } catch (e) {
      alert("Error Top N: " + e.message);
    }
  }

  // ===== RETENTION STRATEGY =====
  async function runRetention() {
    const payload = getPayload();
    const errs = validate(payload);

    const resultBox = $("retentionResult");
    const jsonBoxRet = $("retentionJson");

    if (errs.length) {
      resultBox.innerHTML = `<span class="err">Input Error:</span> ${errs.join("; ")}`;
      jsonBoxRet.textContent = "";
      return;
    }

    resultBox.textContent = "Calculating retention strategy…";
    jsonBoxRet.textContent = "";

    try {
      const m = modelSelect.value;
      const url = m
        ? `${API_BASE}/recommend_retention?model=${encodeURIComponent(m)}`
        : `${API_BASE}/recommend_retention`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      jsonBoxRet.textContent = text;

      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (data.error) {
        resultBox.innerHTML = `<span class="err">${data.error}</span>`;
        return;
      }

      const prob = Number(
        data.churn_probability ?? data.probability ?? 0
      );
      const actions = Array.isArray(data.actions)
        ? data.actions
        : [];

      let html =
        `<div class="muted">Churn Probability: <b>${(prob * 100).toFixed(2)}%</b></div>`;

      if (!actions.length) {
        html += `<p class="muted" style="margin-top:8px;">No specific recommendations available.</p>`;
        resultBox.innerHTML = html;
        return;
      }

      html += `<ul style="margin-top:10px;">`;
      actions.forEach(a => {
        const sp = typeof a.success_probability === "number"
          ? ` – ${(a.success_probability * 100).toFixed(1)}% success rate`
          : "";
        html += `<li><b>${a.action}</b>${sp}</li>`;
      });
      html += `</ul>`;

      resultBox.innerHTML = html;
    } catch (e) {
      resultBox.innerHTML = `<span class="err">Error:</span> ${e.message}`;
      jsonBoxRet.textContent = "";
    }
  }

  // ===== INIT =====
  (async function init() {
    // Bảo vệ trang technical nếu hàm có tồn tại trong admin_auth.js
    if (typeof protectTechnicalPage === "function") {
      protectTechnicalPage();
    }
    await refreshModels();
    await refreshHealth();
  })();