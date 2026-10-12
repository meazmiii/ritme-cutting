const STORAGE_KEY = "ritme-cutting-v1";
const today = localDateKey(new Date());
const foods = [
  { id: "nasi-putih", name: "Nasi putih", portion: "1 centong (100 g)", calories: 130, protein: 2.7 },
  { id: "nasi-merah", name: "Nasi merah", portion: "1 centong (100 g)", calories: 110, protein: 2.5 },
  { id: "ayam-dada", name: "Ayam dada panggang", portion: "100 g", calories: 165, protein: 31 },
  { id: "ayam-paha", name: "Ayam paha tanpa kulit", portion: "100 g", calories: 179, protein: 24 },
  { id: "telur-rebus", name: "Telur rebus", portion: "1 butir", calories: 78, protein: 6.3 },
  { id: "telur-dadar", name: "Telur dadar", portion: "1 butir", calories: 110, protein: 7 },
  { id: "tempe", name: "Tempe kukus", portion: "100 g", calories: 193, protein: 20.3 },
  { id: "tempe-goreng", name: "Tempe goreng", portion: "1 potong (30 g)", calories: 110, protein: 6 },
  { id: "tahu", name: "Tahu putih", portion: "1 potong (80 g)", calories: 64, protein: 6.4 },
  { id: "ikan-kembung", name: "Ikan kembung bakar", portion: "100 g", calories: 167, protein: 25 },
  { id: "ikan-tongkol", name: "Ikan tongkol", portion: "100 g", calories: 130, protein: 27 },
  { id: "sayur-bening", name: "Sayur bening", portion: "1 mangkuk", calories: 35, protein: 2 },
  { id: "kangkung", name: "Tumis kangkung", portion: "1 porsi", calories: 90, protein: 3 },
  { id: "pisang", name: "Pisang", portion: "1 buah sedang", calories: 105, protein: 1.3 },
  { id: "susu-low-fat", name: "Susu UHT rendah lemak", portion: "200 ml", calories: 100, protein: 7 },
];
const defaultState = {
  profile: { name: "Alex" },
  goals: { calories: 1900, protein: 145 },
  meals: {},
  weights: [],
  checkIns: [],
};
let state = loadState();
let toastTimer;
let manualFoodMode = false;

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultState);
    const parsed = JSON.parse(saved);
    return {
      profile: {
        name: typeof parsed.profile?.name === "string" && parsed.profile.name.trim()
          ? parsed.profile.name.trim().slice(0, 30)
          : defaultState.profile.name,
      },
      goals: {
        calories: validNumber(parsed.goals?.calories, 500, 10000, defaultState.goals.calories),
        protein: validNumber(parsed.goals?.protein, 1, 1000, defaultState.goals.protein),
      },
      meals: parsed.meals && typeof parsed.meals === "object" ? parsed.meals : {},
      weights: Array.isArray(parsed.weights) ? parsed.weights.filter((entry) => isValidWeight(entry)) : [],
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
    };
  } catch (error) {
    console.error("Data Ritme gagal dimuat dari penyimpanan lokal.", error);
    return structuredClone(defaultState);
  }
}

function validNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

function isValidWeight(entry) {
  return entry && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && Number.isFinite(entry.value) && entry.value >= 20 && entry.value <= 500;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Data Ritme gagal disimpan ke penyimpanan lokal.", error);
    showToast("Data belum tersimpan. Cek ruang penyimpanan browser kamu.");
    return false;
  }
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function getTodayMeals() {
  const entries = state.meals[today];
  return Array.isArray(entries) ? entries : [];
}

function updateDate() {
  const label = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  document.getElementById("today-label").textContent = label;
}

function renderSummary() {
  const meals = getTodayMeals();
  const calories = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
  const protein = meals.reduce((sum, meal) => sum + Number(meal.protein || 0), 0);
  const caloriePercent = Math.min(100, (calories / state.goals.calories) * 100);
  const proteinPercent = Math.min(100, (protein / state.goals.protein) * 100);
  document.getElementById("calories-consumed").textContent = formatNumber(calories);
  document.getElementById("calories-remaining").textContent = formatNumber(Math.max(0, state.goals.calories - calories));
  document.getElementById("calorie-goal").textContent = formatNumber(state.goals.calories);
  document.getElementById("protein-consumed").textContent = formatNumber(protein, 1);
  document.getElementById("protein-remaining").textContent = formatNumber(Math.max(0, state.goals.protein - protein), 1);
  document.getElementById("protein-goal").textContent = formatNumber(state.goals.protein);
  setProgress("calorie-progress", caloriePercent);
  setProgress("protein-progress", proteinPercent);
  renderWeightSummary();
}

function renderProfile() {
  document.getElementById("welcome-name").textContent = state.profile.name;
  document.getElementById("profile-name").textContent = state.profile.name;
  document.querySelector(".avatar").textContent = state.profile.name.charAt(0).toLocaleUpperCase("id-ID");
}

function setProgress(id, percent) {
  const progress = document.getElementById(id);
  progress.setAttribute("aria-valuenow", String(Math.round(percent)));
  progress.querySelector("span").style.width = `${percent}%`;
}

function renderMeals() {
  const container = document.getElementById("meal-list");
  const meals = getTodayMeals();
  if (!meals.length) {
    container.innerHTML = '<div class="empty-meals"><strong>Mulai dari satu catatan kecil</strong><span>Tambah makananmu, tanpa perlu harus sempurna.</span></div>';
    return;
  }
  const icons = { Sarapan: "🍳", "Makan siang": "🍚", "Makan malam": "🥗", Camilan: "🍌" };
  const classes = { Sarapan: "", "Makan siang": "lunch", "Makan malam": "dinner", Camilan: "snack" };
  container.innerHTML = meals.map((meal) => `
    <article class="meal-row">
      <span class="meal-avatar ${classes[meal.type] || ""}" aria-hidden="true">${icons[meal.type] || "🍽️"}</span>
      <div class="meal-main"><strong>${escapeHtml(meal.name)}</strong><span>${escapeHtml(meal.type)}</span></div>
      <span class="meal-macros"><strong>${formatNumber(meal.calories)}</strong> kkal · ${formatNumber(meal.protein, 1)}g protein</span>
      <button class="remove-meal" type="button" data-remove-meal="${escapeHtml(meal.id)}" aria-label="Hapus ${escapeHtml(meal.name)}" title="Hapus catatan">×</button>
    </article>
  `).join("");
}

function renderQuickFoods() {
  const container = document.getElementById("quick-food-list");
  container.innerHTML = foods.map((food) => `
    <div class="quick-food-option">
      <input type="checkbox" name="quick-food" value="${food.id}" aria-label="Pilih ${escapeHtml(food.name)}" />
      <span class="quick-food-copy"><strong>${escapeHtml(food.name)}</strong><small>${escapeHtml(food.portion)}</small></span>
      <span class="quick-food-macros">~${formatNumber(food.calories)} kkal</span>
      <span class="food-quantity-control">
        <button type="button" data-quantity-change="-1" data-food-id="${food.id}" aria-label="Kurangi ${escapeHtml(food.name)}" disabled>−</button>
        <span data-food-quantity="${food.id}" aria-label="Jumlah ${escapeHtml(food.name)}">0</span>
        <button type="button" data-quantity-change="1" data-food-id="${food.id}" aria-label="Tambah ${escapeHtml(food.name)}">+</button>
      </span>
    </div>
  `).join("");
  updateQuickFoodSummary();
}

function updateQuickFoodSummary() {
  const form = document.getElementById("meal-form");
  const selected = [...form.querySelectorAll('input[name="quick-food"]:checked')]
    .map((input) => ({
      food: foods.find((food) => food.id === input.value),
      quantity: Number(form.querySelector(`[data-food-quantity="${input.value}"]`).textContent),
    }))
    .filter(Boolean);
  const summary = document.getElementById("quick-food-summary");
  const saveButton = document.getElementById("save-meal-button");
  if (!selected.length) {
    summary.textContent = "Pilih makananmu";
    saveButton.textContent = "Catat pilihan";
    saveButton.disabled = true;
    return;
  }
  const calories = selected.reduce((sum, item) => sum + item.food.calories * item.quantity, 0);
  const protein = selected.reduce((sum, item) => sum + item.food.protein * item.quantity, 0);
  const portions = selected.reduce((sum, item) => sum + item.quantity, 0);
  summary.innerHTML = `<strong>${portions} porsi</strong><span>~${formatNumber(calories)} kkal · ${formatNumber(protein, 1)} g protein</span>`;
  saveButton.textContent = `Catat ${portions} porsi`;
  saveButton.disabled = false;
}

function changeFoodQuantity(foodId, amount) {
  const row = document.querySelector(`.quick-food-option input[value="${foodId}"]`)?.closest(".quick-food-option");
  if (!row) return;
  const checkbox = row.querySelector('input[name="quick-food"]');
  const quantity = row.querySelector(`[data-food-quantity="${foodId}"]`);
  const next = Math.max(0, Math.min(20, Number(quantity.textContent) + amount));
  quantity.textContent = String(next);
  checkbox.checked = next > 0;
  row.querySelector('[data-quantity-change="-1"]').disabled = next === 0;
  row.querySelector('[data-quantity-change="1"]').disabled = next === 20;
  updateQuickFoodSummary();
}

function setManualFoodMode(enabled) {
  manualFoodMode = enabled;
  document.getElementById("quick-food-panel").hidden = enabled;
  document.getElementById("manual-food-panel").hidden = !enabled;
  document.querySelectorAll("#manual-food-panel input").forEach((input) => {
    input.disabled = !enabled;
    input.required = enabled;
  });
  document.getElementById("manual-food-toggle").textContent = enabled ? "← Pilihan cepat" : "＋ Manual";
  const saveButton = document.getElementById("save-meal-button");
  saveButton.textContent = enabled ? "Simpan makanan" : "Catat pilihan";
  if (!enabled) updateQuickFoodSummary();
  else saveButton.disabled = false;
}

function renderWeightSummary() {
  const latest = state.weights[state.weights.length - 1];
  const weightValue = document.getElementById("current-weight");
  const changeLabel = document.getElementById("weight-change");
  if (!latest) {
    weightValue.textContent = "—";
    changeLabel.textContent = "Catat berat pertamamu";
    return;
  }
  weightValue.textContent = formatNumber(latest.value, 1);
  const previous = state.weights[state.weights.length - 2];
  if (!previous) {
    changeLabel.textContent = "Awal yang baik — lanjut sesuai nyaman";
    return;
  }
  const difference = latest.value - previous.value;
  const direction = difference > 0 ? "naik" : difference < 0 ? "turun" : "tetap";
  changeLabel.textContent = `${direction} ${formatNumber(Math.abs(difference), 1)} kg dari catatan sebelumnya`;
}

function renderChart() {
  const points = state.weights.slice(-7);
  const chart = document.getElementById("weight-chart");
  const labels = document.getElementById("chart-x-labels");
  const current = document.getElementById("chart-current");
  const summaryText = document.getElementById("chart-summary-text");
  if (!points.length) {
    current.textContent = "—";
    summaryText.textContent = "kg · tren mingguan";
    chart.setAttribute("aria-label", "Belum ada catatan berat untuk ditampilkan.");
    chart.innerHTML = '<line class="chart-grid-line" x1="8" y1="20" x2="412" y2="20"></line><line class="chart-grid-line" x1="8" y1="83" x2="412" y2="83"></line><line class="chart-grid-line" x1="8" y1="146" x2="412" y2="146"></line><text class="chart-empty-label" x="210" y="88">Catat berat untuk mulai lihat trenmu</text>';
    labels.innerHTML = "<span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span><span>—</span>";
    document.getElementById("chart-y-top").textContent = "—";
    document.getElementById("chart-y-middle").textContent = "—";
    document.getElementById("chart-y-bottom").textContent = "—";
    return;
  }
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.8);
  const chartMin = min - range * 0.2;
  const chartMax = max + range * 0.2;
  const xAt = (index) => points.length === 1 ? 210 : 12 + (index * 396) / (points.length - 1);
  const yAt = (value) => 12 + ((chartMax - value) / (chartMax - chartMin)) * 132;
  const coords = points.map((point, index) => [xAt(index), yAt(point.value)]);
  const line = coords.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
  const area = `${line} L ${coords.at(-1)[0]} 160 L ${coords[0][0]} 160 Z`;
  chart.innerHTML = `<defs><linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#8caf8a" stop-opacity=".24"></stop><stop offset="100%" stop-color="#8caf8a" stop-opacity="0"></stop></linearGradient></defs><line class="chart-grid-line" x1="8" y1="25" x2="412" y2="25"></line><line class="chart-grid-line" x1="8" y1="82" x2="412" y2="82"></line><line class="chart-grid-line" x1="8" y1="139" x2="412" y2="139"></line><path class="chart-area" d="${area}"></path><path class="chart-line" d="${line}"></path>${coords.map(([x, y]) => `<circle class="chart-point" cx="${x}" cy="${y}" r="3.5"></circle>`).join("")}`;
  chart.setAttribute("aria-label", `Berat terakhir ${formatNumber(values.at(-1), 1)} kilogram, ditampilkan dalam tren ${points.length} catatan terakhir.`);
  current.textContent = formatNumber(values.at(-1), 1);
  summaryText.textContent = `kg · ${points.length} catatan terakhir`;
  const ticks = [chartMax, (chartMax + chartMin) / 2, chartMin];
  ["chart-y-top", "chart-y-middle", "chart-y-bottom"].forEach((id, index) => {
    document.getElementById(id).textContent = formatNumber(ticks[index], 1);
  });
  labels.innerHTML = points.map((point) => {
    const date = new Date(`${point.date}T12:00:00`);
    return `<span>${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date)}</span>`;
  }).join("");
}

function render() {
  updateDate();
  renderProfile();
  renderSummary();
  renderMeals();
  renderChart();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function openDialog(id) {
  document.getElementById(id).showModal();
}

function closeDialog(dialog) {
  dialog.close();
}

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button.closest("dialog")));
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });
});

document.querySelectorAll("[data-nav]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll("[data-nav]").forEach((item) => item.classList.toggle("active", item === link));
  });
});

document.getElementById("log-weight-button").addEventListener("click", () => openDialog("weight-dialog"));
document.getElementById("settings-button").addEventListener("click", showSettings);
document.getElementById("settings-button-mobile").addEventListener("click", showSettings);
document.getElementById("checkin-button").addEventListener("click", () => openDialog("checkin-dialog"));

function showSettings() {
  const form = document.getElementById("settings-form");
  form.elements.name.value = state.profile.name;
  form.elements.calories.value = state.goals.calories;
  form.elements.protein.value = state.goals.protein;
  openDialog("settings-dialog");
}

function resetMealDialog() {
  const form = document.getElementById("meal-form");
  const mealType = form.elements.type.value;
  form.reset();
  form.elements.type.value = mealType;
  setManualFoodMode(false);
  updateQuickFoodSummary();
}

document.getElementById("meal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const entries = manualFoodMode
    ? [{
        name: String(data.get("name")).trim(),
        calories: Number(data.get("calories")),
        protein: Number(data.get("protein")),
        foodId: null,
        servings: null,
      }]
    : [...form.querySelectorAll('input[name="quick-food"]:checked')].map((input) => {
        const food = foods.find((item) => item.id === input.value);
        const quantity = Number(form.querySelector(`[data-food-quantity="${food.id}"]`).textContent);
        return {
          name: quantity === 1 ? food.name : `${food.name} × ${formatNumber(quantity, 2)}`,
          calories: Math.round(food.calories * quantity),
          protein: Math.round(food.protein * quantity * 10) / 10,
          foodId: food.id,
          servings: quantity,
        };
      });
  if (!entries.length || entries.some((meal) => !meal.name || !Number.isFinite(meal.calories) || !Number.isFinite(meal.protein))) {
    showToast(manualFoodMode ? "Cek nama makanan, kalori, dan protein yang kamu masukkan." : "Pilih makanan yang mau dicatat dulu.");
    return;
  }
  const type = String(data.get("type"));
  state.meals[today] = [...getTodayMeals(), ...entries.map((meal) => ({
    ...meal,
    id: crypto.randomUUID(),
    type,
  }))];
  const saved = saveState();
  render();
  resetMealDialog();
  closeDialog(document.getElementById("meal-dialog"));
  if (saved) showToast("Makanan berhasil dicatat.");
});

document.getElementById("add-meal-button").addEventListener("click", () => {
  resetMealDialog();
  openDialog("meal-dialog");
});
document.getElementById("quick-food-list").addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[name="quick-food"]');
  if (!checkbox) return;
  const row = checkbox.closest(".quick-food-option");
  const quantity = row.querySelector(`[data-food-quantity="${checkbox.value}"]`);
  const next = checkbox.checked ? Math.max(1, Number(quantity.textContent)) : 0;
  quantity.textContent = String(next);
  row.querySelector('[data-quantity-change="-1"]').disabled = next === 0;
  row.querySelector('[data-quantity-change="1"]').disabled = next === 20;
  updateQuickFoodSummary();
});
document.getElementById("quick-food-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity-change]");
  if (!button) return;
  changeFoodQuantity(button.dataset.foodId, Number(button.dataset.quantityChange));
});
document.getElementById("manual-food-toggle").addEventListener("click", () => setManualFoodMode(!manualFoodMode));
document.getElementById("meal-dialog").addEventListener("close", resetMealDialog);

document.getElementById("meal-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-meal]");
  if (!button) return;
  state.meals[today] = getTodayMeals().filter((meal) => meal.id !== button.dataset.removeMeal);
  const saved = saveState();
  render();
  if (saved) showToast("Catatan makanan dihapus.");
});

document.getElementById("weight-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const value = Number(new FormData(form).get("weight"));
  if (!Number.isFinite(value) || value < 20 || value > 500) {
    showToast("Masukkan berat dalam rentang 20–500 kg.");
    return;
  }
  const existing = state.weights.findIndex((entry) => entry.date === today);
  const entry = { date: today, value };
  if (existing >= 0) state.weights[existing] = entry;
  else state.weights.push(entry);
  state.weights.sort((a, b) => a.date.localeCompare(b.date));
  const saved = saveState();
  render();
  form.reset();
  closeDialog(document.getElementById("weight-dialog"));
  if (saved) showToast("Berat berhasil dicatat. Lihat tren, bukan satu angka.");
});

document.getElementById("settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const calories = Number(data.get("calories"));
  const protein = Number(data.get("protein"));
  if (!name || name.length > 30 || !Number.isFinite(calories) || calories < 500 || calories > 10000 || !Number.isFinite(protein) || protein < 1 || protein > 1000) {
    showToast("Pastikan targetmu dalam rentang yang tersedia.");
    return;
  }
  state.profile.name = name;
  state.goals = { calories, protein };
  const saved = saveState();
  render();
  closeDialog(document.getElementById("settings-dialog"));
  if (saved) showToast("Target harian berhasil diperbarui.");
});

document.getElementById("checkin-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const checkIn = {
    date: today,
    energy: Number(data.get("energy")),
    hunger: Number(data.get("hunger")),
    note: String(data.get("note")).trim(),
  };
  if (![1, 2, 3, 4, 5].includes(checkIn.energy) || ![1, 2, 3, 4, 5].includes(checkIn.hunger)) {
    showToast("Pilih jawaban untuk energi dan rasa lapar dulu.");
    return;
  }
  const existing = state.checkIns.findIndex((entry) => entry.date === today);
  if (existing >= 0) state.checkIns[existing] = checkIn;
  else state.checkIns.push(checkIn);
  const saved = saveState();
  closeDialog(document.getElementById("checkin-dialog"));
  form.reset();
  if (saved) showToast("Check-in tersimpan. Makasih sudah dengerin badanmu.");
});

renderQuickFoods();
render();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.error("Ritme gagal disiapkan untuk penggunaan offline.", error);
  });
}
