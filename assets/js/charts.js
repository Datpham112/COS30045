const NAVY = "#12263a";
const AMBER = "#f5b700";
const SLATE = "#4a5b6c";
const PALE = "#b9c7d6";
const MID = "#6f8ba8";

const money = (value) => "$" + Math.round(value).toLocaleString("en-AU");
const cost = (kwh) => kwh * TV_DATA.tariff;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
Chart.defaults.font.size = 13;
Chart.defaults.color = SLATE;
if (reduceMotion) {
  Chart.defaults.animation = false;
}

const annotate = {
  id: "annotate",
  afterDatasetsDraw(chart, args, options) {
    const ctx = chart.ctx;
    ctx.save();
    if (options.labels) {
      ctx.font = "600 13px " + Chart.defaults.font.family;
      ctx.fillStyle = NAVY;
      ctx.textAlign = "center";
      chart.getDatasetMeta(0).data.forEach(function (bar, i) {
        if (options.labels[i]) {
          ctx.fillText(options.labels[i], bar.x, bar.y - 8);
        }
      });
    }
    if (options.medians) {
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 3;
      chart.getDatasetMeta(0).data.forEach(function (bar, i) {
        const y = chart.scales.y.getPixelForValue(options.medians[i]);
        ctx.beginPath();
        ctx.moveTo(bar.x - bar.width / 2, y);
        ctx.lineTo(bar.x + bar.width / 2, y);
        ctx.stroke();
      });
    }
    if (options.refLine) {
      const y = chart.scales.y.getPixelForValue(options.refLine.value);
      const area = chart.chartArea;
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(area.left, y);
      ctx.lineTo(area.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 13px " + Chart.defaults.font.family;
      ctx.fillStyle = NAVY;
      ctx.textAlign = "right";
      ctx.fillText(options.refLine.text, area.right - 4, y - 8);
    }
    ctx.restore();
  },
};

const baseOptions = (xTitle, yTitle) => ({
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 24 } },
  plugins: { legend: { display: false } },
  scales: {
    x: { title: { display: !!xTitle, text: xTitle }, grid: { display: false }, ticks: { maxRotation: 0, autoSkip: false } },
    y: { beginAtZero: true, title: { display: !!yTitle, text: yTitle }, grid: { color: "#e6ebf0" } },
  },
});

const sizeLabels = TV_DATA.size.map((s) => s.size + '"');
const highlight = (colour, other) => TV_DATA.size.map((s) => (s.size === 55 ? colour : other));

new Chart(document.getElementById("chart-size"), {
  type: "bar",
  data: {
    labels: sizeLabels,
    datasets: [{
      label: "Median kWh per year",
      data: TV_DATA.size.map((s) => s.median),
      backgroundColor: highlight(AMBER, NAVY),
    }],
  },
  options: Object.assign(baseOptions("Screen size (inches)", "Labelled energy use (kWh a year)"), {
    plugins: {
      legend: { display: false },
      annotate: { labels: TV_DATA.size.map((s) => money(cost(s.median))) },
    },
  }),
  plugins: [annotate],
});

new Chart(document.getElementById("chart-range"), {
  type: "bar",
  data: {
    labels: sizeLabels,
    datasets: [
      {
        type: "bar",
        label: "Lowest to highest",
        data: TV_DATA.size.map((s) => [s.min, s.max]),
        backgroundColor: highlight(MID, PALE),
        borderSkipped: false,
      },
    ],
  },
  options: Object.assign(baseOptions("Screen size (inches)", "Labelled energy use (kWh a year)"), {
    plugins: {
      legend: { display: false },
      annotate: {
        medians: TV_DATA.size.map((s) => s.median),
        labels: TV_DATA.size.map((s) => (s.size === 55 ? s.min + " to " + s.max + " kWh" : "")),
      },
    },
  }),
  plugins: [annotate],
});

const starLabels = TV_DATA.star.map((s) => [s.stars.replace(" or more", "+") + " stars", "(" + s.n + " TVs)"]);
const typical75 = TV_DATA.size.find((s) => s.size === 75).median;
const typical75Label = Math.round(typical75);

new Chart(document.getElementById("chart-stars"), {
  type: "bar",
  data: {
    labels: starLabels,
    datasets: [{
      label: "Median kWh per year",
      data: TV_DATA.star.map((s) => s.median),
      backgroundColor: NAVY,
    }],
  },
  options: Object.assign(baseOptions("Star rating band, 55-inch TVs", "Labelled energy use (kWh a year)"), {
    plugins: {
      legend: { display: false },
      annotate: {
        labels: TV_DATA.star.map((s) => Math.round(s.median) + " kWh"),
        refLine: { value: typical75, text: "Typical 75-inch TV: " + typical75Label + " kWh" },
      },
    },
  }),
  plugins: [annotate],
});

function makeTable(headers, rows) {
  const table = document.createElement("table");
  const head = table.createTHead().insertRow();
  headers.forEach(function (text) {
    const th = document.createElement("th");
    th.textContent = text;
    head.appendChild(th);
  });
  const body = table.createTBody();
  rows.forEach(function (row) {
    const tr = body.insertRow();
    row.forEach(function (value) {
      tr.insertCell().textContent = value;
    });
  });
  return table;
}

const tables = {
  size: () => makeTable(
    ["Size", "TVs", "Median kWh", "Median cost a year"],
    TV_DATA.size.map((s) => [s.size + '"', s.n, s.median, money(cost(s.median))])
  ),
  range: () => makeTable(
    ["Size", "Lowest kWh", "Median kWh", "Highest kWh"],
    TV_DATA.size.map((s) => [s.size + '"', s.min, s.median, s.max])
  ),
  stars: () => makeTable(
    ["Star band", "TVs", "Median kWh", "Lowest kWh", "Highest kWh"],
    TV_DATA.star.map((s) => [s.stars, s.n, s.median, s.min, s.max])
  ),
};

document.querySelectorAll("[data-table]").forEach(function (details) {
  details.appendChild(tables[details.dataset.table]());
});
