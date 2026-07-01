# vitals. — Health Self-Check Kiosk

A walk-in self-service web app that lets students and staff check their BMI
privately, see a plain-language health category, and get a short
recommendation — without a clinic visit.

Built for **Laboratory Activity 5: Building a Responsive Health Self-Check
Web Application** (DLSU-D, College of Information and Computer Studies,
Information Technology Department).

## The problem it solves

Many students and employees on campus have no quick, private way to check
their BMI and get a basic wellness recommendation. This kiosk lets someone
enter their name, age, sex, weight, and height, instantly computes their
BMI, classifies it, and shows a tailored message — while quietly logging the
entry to a shared Google Sheet so the nurse's office can follow up with
at-risk individuals.

## How it works

1. Enter your name, age, sex, weight (kg), and height (cm).
2. The form validates every field before doing any math.
3. Your BMI is calculated as `weight (kg) ÷ [height (m)]²`.
4. A colored result card shows your BMI, category, and a short
   recommendation.
5. The entry is added to this session's "Recent check-ins" list and sent to
   a connected Google Sheet.

| BMI range     | Category    |
| -------------- | ----------- |
| Below 18.5     | Underweight |
| 18.5 – 24.9    | Normal      |
| 25.0 – 29.9    | Overweight  |
| 30.0 and above | Obese       |

## Project structure

```
health-checker-kiosk/
├── index.html            # Semantic HTML structure (form + result + history)
├── style.css              # Pastel pink, card-based, responsive styling
├── script.js               # Validation, BMI logic, and Sheet logging
├── appsscript-code.gs   # Paste into Google Apps Script on the Sheet
└── README.md
```

## Running it locally

Just open `index.html` in a browser — no build step required.

## Connecting the Google Sheet

1. Create a Google Sheet named **BMI Kiosk Records** with header row:
   `Timestamp | Name | Age | Sex | Weight | Height | BMI | Category`.
2. Open **Extensions > Apps Script**, paste in the contents of
   `appsscript-code.gs`, and deploy as a **Web App**
   (Execute as: *Me*, Who has access: *Anyone*).
3. Copy the deployed Web App URL into the `WEB_APP_URL` constant at the top
   of `script.js`.
4. Every submission now appends a row to the sheet.

## Live demo

_Add your GitHub Pages link here once deployed._

## Control structures used

- **if-else / else-if** — validates age, weight, and height ranges before
  the BMI is calculated.
- **switch-case** — maps the computed BMI to a category, message, and
  result color.
- **loop (for...of / forEach)** — checks all required fields in one pass on
  submit, and renders the running list of this session's check-ins.