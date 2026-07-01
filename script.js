/* ===========================
   vitals. — Health Self-Check Kiosk
   script.js
   =========================== */

// TODO: replace with your deployed Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwGe0iA4WvJGOp6ZkMUB_z1G0P9gfLRVX8VDg2fFE3n9vJDl5tEYFyRV_kGIQQN3jOesA/exec';

// Gauge is drawn for BMI values from 15 to 40; values outside this range
// still show their real number, but the needle clamps to the nearest edge.
const GAUGE_MIN = 15;
const GAUGE_MAX = 40;

const form = document.getElementById('bmiForm');
const resultCard = document.getElementById('resultCard');
const formNote = document.getElementById('formNote');
const checkAgainBtn = document.getElementById('checkAgainBtn');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');
const ticketCount = document.getElementById('ticketCount');
const siteNav = document.getElementById('siteNav');

window.addEventListener('scroll', function () {
  siteNav.classList.toggle('is-scrolled', window.scrollY > 8);
});

// In-memory array of this session's submissions (used by the loop below)
const submissions = [];

// Field IDs required before we'll process the form.
// Looping through this list is how we check every field in one pass
// instead of writing five separate if-statements.
const requiredFields = [
  { id: 'name', label: 'Full name' },
  { id: 'age', label: 'Age' },
  { id: 'sex', label: 'Sex' },
  { id: 'weight', label: 'Weight' },
  { id: 'height', label: 'Height' },
];

form.addEventListener('submit', function (e) {
  e.preventDefault();
  clearFieldErrors();

  const values = {
    name: document.getElementById('name').value.trim(),
    age: document.getElementById('age').value.trim(),
    sex: document.getElementById('sex').value,
    weight: document.getElementById('weight').value.trim(),
    height: document.getElementById('height').value.trim(),
  };

  // ---- LOOP: walk through every required field in one pass ----
  let firstInvalidField = null;
  for (const field of requiredFields) {
    const val = values[field.id];
    if (!val) {
      showFieldError(field.id, `${field.label} is required.`);
      if (!firstInvalidField) firstInvalidField = field.id;
    }
  }

  if (firstInvalidField) {
    formNote.textContent = 'Please fill out all fields before submitting.';
    document.getElementById(firstInvalidField).focus();
    return;
  }

  const age = parseFloat(values.age);
  const weight = parseFloat(values.weight);
  const heightCm = parseFloat(values.height);

  // ---- IF-ELSE: validate ranges before we trust the numbers ----
  if (isNaN(age) || age <= 0 || age > 120) {
    showFieldError('age', 'Enter an age between 1 and 120.');
    formNote.textContent = 'Please check the highlighted field.';
    return;
  } else if (isNaN(weight) || weight <= 0) {
    showFieldError('weight', 'Enter a weight greater than 0.');
    formNote.textContent = 'Please check the highlighted field.';
    return;
  } else if (isNaN(heightCm) || heightCm <= 0) {
    showFieldError('height', 'Enter a height greater than 0.');
    formNote.textContent = 'Please check the highlighted field.';
    return;
  } else {
    formNote.textContent = '';
  }

  // ---- Compute BMI ----
  const heightM = heightCm / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);

  let category, message, colorClass;

  // ---- SWITCH-CASE: map the BMI value to a category, message, and color ----
  switch (true) {
    case bmi < 18.5:
      category = 'Underweight';
      colorClass = 'cat-underweight';
      message = 'Consider a balanced, calorie-sufficient diet and check in with a clinician if this continues.';
      break;
    case bmi < 25:
      category = 'Normal';
      colorClass = 'cat-normal';
      message = 'Nice work — your BMI is within the typical healthy range. Keep up your habits!';
      break;
    case bmi < 30:
      category = 'Overweight';
      colorClass = 'cat-overweight';
      message = 'Consider more physical activity and mindful eating. Small, steady changes add up.';
      break;
    default:
      category = 'Obese';
      colorClass = 'cat-obese';
      message = 'We recommend consulting a healthcare provider for personalized guidance.';
  }

  showResult(values.name, bmi, category, message, colorClass);

  const record = {
    name: values.name,
    age,
    sex: values.sex,
    weight,
    heightCm,
    bmi,
    category,
  };

  submissions.unshift(record);
  renderHistory();
  updateTicket();
  recordSubmission(record);

  form.reset();
});

checkAgainBtn.addEventListener('click', function () {
  resultCard.classList.add('hidden');
  document.getElementById('name').focus();
});

function showFieldError(fieldId, msg) {
  const errorEl = document.getElementById(fieldId + 'Error');
  if (errorEl) errorEl.textContent = msg;
}

function clearFieldErrors() {
  requiredFields.forEach((field) => {
    const errorEl = document.getElementById(field.id + 'Error');
    if (errorEl) errorEl.textContent = '';
  });
  formNote.textContent = '';
}

function showResult(name, bmi, category, message, colorClass) {
  document.getElementById('resultName').textContent = name;
  document.getElementById('bmiNumber').textContent = bmi.toFixed(1);
  document.getElementById('resultMessage').textContent = message;

  const pill = document.getElementById('categoryPill');
  pill.textContent = category;
  pill.className = 'category-pill ' + colorClass;

  const readout = document.getElementById('bmiReadout');
  readout.className = 'bmi-readout ' + colorClass;

  const hub = document.getElementById('gaugeHub');
  hub.className = 'gauge-hub ' + colorClass;

  // Position the needle along the 15–40 gauge scale
  const clamped = Math.min(Math.max(bmi, GAUGE_MIN), GAUGE_MAX);
  const position = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  const angle = -90 + position * 180;
  document.getElementById('gaugeNeedle').style.transform = `rotate(${angle}deg)`;

  resultCard.classList.remove('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- LOOP: forEach renders the running list of this session's check-ins ----
function renderHistory() {
  historyList.innerHTML = '';

  if (submissions.length === 0) {
    historyList.appendChild(historyEmpty);
    return;
  }

  submissions.forEach((entry) => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = `${entry.name} — ${entry.bmi.toFixed(1)}`;

    const tag = document.createElement('span');
    tag.className = 'history-tag ' + categoryClass(entry.category);
    tag.textContent = entry.category;

    li.appendChild(label);
    li.appendChild(tag);
    historyList.appendChild(li);
  });
}

function categoryClass(category) {
  switch (category) {
    case 'Underweight':
      return 'cat-underweight';
    case 'Normal':
      return 'cat-normal';
    case 'Overweight':
      return 'cat-overweight';
    default:
      return 'cat-obese';
  }
}

// Keeps the header ticket honest — it reflects real activity this session,
// not a made-up counter.
function updateTicket() {
  ticketCount.textContent = submissions.length;
}

// ---- Send the record to the Google Apps Script Web App (Google Sheet) ----
function recordSubmission(record) {
  if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_WEB_APP_URL') {
    console.warn('WEB_APP_URL is not set — skipping Google Sheet logging.');
    return;
  }

  fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(record),
  }).catch((err) => console.error('Could not record submission:', err));
}