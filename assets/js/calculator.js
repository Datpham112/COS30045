const form = document.getElementById("calc-form");
const modelSelect = document.getElementById("model");
const fields = {
  watts: document.getElementById("watts"),
  hours: document.getElementById("hours"),
  price: document.getElementById("price"),
};
const errorEls = {
  watts: document.getElementById("watts-error"),
  hours: document.getElementById("hours-error"),
  price: document.getElementById("price-error"),
};
const statusEl = document.getElementById("results-status");
const outputs = {
  dailyKwh: document.getElementById("out-daily-kwh"),
  monthlyKwh: document.getElementById("out-monthly-kwh"),
  yearlyKwh: document.getElementById("out-yearly-kwh"),
  monthlyCost: document.getElementById("out-monthly-cost"),
  yearlyCost: document.getElementById("out-yearly-cost"),
};

const DEFAULT_SIZE = 55;
const DAYS_PER_YEAR = 365;
const LIMITS = {
  watts: { max: 10000, label: "Power usage" },
  hours: { max: 24, label: "Hours of use" },
  price: { max: 1000, label: "Electricity price" },
};

TV_DATA.size.forEach(function (row) {
  const option = document.createElement("option");
  option.value = row.watts;
  option.textContent = row.size + " inch (about " + row.watts + " W)";
  option.dataset.size = row.size;
  modelSelect.appendChild(option);
});
const custom = document.createElement("option");
custom.value = "custom";
custom.textContent = "Other (enter watts below)";
modelSelect.appendChild(custom);

function validateField(name) {
  const input = fields[name];
  const limit = LIMITS[name];
  if (input.validity.badInput || input.value.trim() === "") {
    return limit.label + " is required. Enter a number.";
  }
  const value = Number(input.value);
  if (name === "watts" && value <= 0) {
    return "Power usage must be greater than 0 watts.";
  }
  if (value < 0) {
    return limit.label + " cannot be negative.";
  }
  if (value > limit.max) {
    return limit.label + " must be " + limit.max + " or less.";
  }
  return "";
}

function validateAll() {
  let allValid = true;
  Object.keys(fields).forEach(function (name) {
    const message = validateField(name);
    errorEls[name].textContent = message;
    fields[name].classList.toggle("invalid", message !== "");
    fields[name].setAttribute("aria-invalid", String(message !== ""));
    if (message !== "") {
      allValid = false;
    }
  });
  return allValid;
}

function calculate(watts, hoursPerDay, centsPerKwh) {
  const dailyKwh = (watts * hoursPerDay) / 1000;
  const monthlyKwh = (dailyKwh * DAYS_PER_YEAR) / 12;
  const yearlyKwh = dailyKwh * DAYS_PER_YEAR;
  const dollarsPerKwh = centsPerKwh / 100;
  return {
    dailyKwh: dailyKwh,
    monthlyKwh: monthlyKwh,
    yearlyKwh: yearlyKwh,
    monthlyCost: monthlyKwh * dollarsPerKwh,
    yearlyCost: yearlyKwh * dollarsPerKwh,
  };
}

const formatKwh = (value) =>
  value.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kWh";
const formatMoney = (value) =>
  value.toLocaleString("en-AU", { style: "currency", currency: "AUD" });

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function update() {
  if (!validateAll()) {
    Object.values(outputs).forEach(function (el) {
      el.textContent = "\u2013";
    });
    setStatus("Fix the highlighted fields to see your results.", true);
    return;
  }
  const watts = Number(fields.watts.value);
  const hours = Number(fields.hours.value);
  const price = Number(fields.price.value);
  const result = calculate(watts, hours, price);

  outputs.dailyKwh.textContent = formatKwh(result.dailyKwh);
  outputs.monthlyKwh.textContent = formatKwh(result.monthlyKwh);
  outputs.yearlyKwh.textContent = formatKwh(result.yearlyKwh);
  outputs.monthlyCost.textContent = formatMoney(result.monthlyCost);
  outputs.yearlyCost.textContent = formatMoney(result.yearlyCost);
  setStatus("Based on " + watts + " W for " + hours + " hours a day at " + price + " c/kWh.", false);
}

function syncModelToWatts() {
  const match = Array.from(modelSelect.options).find(function (option) {
    return option.value !== "custom" && Number(option.value) === Number(fields.watts.value);
  });
  modelSelect.value = match ? match.value : "custom";
}

function setDefaults() {
  const defaultOption = Array.from(modelSelect.options).find(function (option) {
    return Number(option.dataset.size) === DEFAULT_SIZE;
  });
  modelSelect.value = defaultOption.value;
  fields.watts.value = defaultOption.value;
}

modelSelect.addEventListener("change", function () {
  if (modelSelect.value !== "custom") {
    fields.watts.value = modelSelect.value;
  } else {
    fields.watts.focus();
  }
  update();
});

fields.watts.addEventListener("input", function () {
  syncModelToWatts();
  update();
});
fields.hours.addEventListener("input", update);
fields.price.addEventListener("input", update);

form.addEventListener("submit", function (event) {
  event.preventDefault();
  update();
});

form.addEventListener("reset", function () {
  setTimeout(function () {
    setDefaults();
    update();
  }, 0);
});

setDefaults();
update();
