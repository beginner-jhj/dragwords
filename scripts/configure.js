const targetLangSelect = document.getElementById("targetLangSelect");
const targetLangOptions = document.querySelectorAll(".target-lang-option");
const difficultReviewCycleOptions = document.querySelectorAll(
  ".review-cycle-option-difficult"
);
const normalReviewCycleOptions = document.querySelectorAll(
  ".review-cycle-option-normal"
);
const easyReviewCycleOptions = document.querySelectorAll(
  ".review-cycle-option-easy"
);

const difficultLevelCycleSelect = document.getElementById(
  "difficultLevelCycleSelect"
);
const normalLevelCycleSelect = document.getElementById(
  "normalLevelCycleSelect"
);
const easyLevelCycleSelect = document.getElementById("easyLevelCycleSelect");
const saveButton = document.getElementById("saveButton");

let targetLang;
let levelName;
let reviewCycle;

async function getDefaultTargetlang() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ defaultTargetLang: "" }, (result) => {
      resolve(result.defaultTargetLang);
    });
  });
}

async function getReviewCycle() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ reviewCycle: {} }, (result) => {
      resolve(result.reviewCycle);
    });
  });
}

function setSelectedOption(options, condition) {
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === condition) {
      options[i].selected = true;
      break;
    }
  }
}

function saveDefaultTargetlang(targetLang) {
  chrome.storage.local.set({ defaultTargetLang: targetLang });
}

function saveReviewCycle(levelName, cycle) {
  chrome.storage.local.get({ reviewCycle: {} }, (result) => {
    const updatedReviewCycle = result.reviewCycle;
    updatedReviewCycle[levelName] = cycle;
    chrome.storage.local.set({ reviewCycle: updatedReviewCycle });
  });
}

function enableSaveButton() {
  saveButton.style.backgroundColor = "#FF9800";
  saveButton.disabled = false;
}

targetLangSelect.addEventListener("change", (e) => {
  enableSaveButton();
  targetLang = e.target.value;
});

difficultLevelCycleSelect.addEventListener("change", (e) => {
  enableSaveButton();
  levelName = "difficult";
  reviewCycle = e.target.value;
});

normalLevelCycleSelect.addEventListener("change", (e) => {
  enableSaveButton();
  levelName = "normal";
  reviewCycle = e.target.value;
});

easyLevelCycleSelect.addEventListener("change", (e) => {
  enableSaveButton();
  levelName = "easy";
  reviewCycle = e.target.value;
});

saveButton.addEventListener("click", () => {
  if (targetLang) {
    saveDefaultTargetlang(targetLang);
  } else if (levelName && reviewCycle) {
    saveReviewCycle(levelName, reviewCycle);
  } else {
    saveDefaultTargetlang(targetLang);
    saveReviewCycle(levelName, reviewCycle);
  }

  saveButton.style.backgroundColor = "#757575";
});

document.addEventListener("DOMContentLoaded", async () => {
  const defaultTargetLang = await getDefaultTargetlang();
  const reviewCycle = await getReviewCycle();

  setSelectedOption(targetLangOptions, defaultTargetLang);
  setSelectedOption(difficultReviewCycleOptions, reviewCycle.difficult);
  setSelectedOption(normalReviewCycleOptions, reviewCycle.normal);
  setSelectedOption(easyReviewCycleOptions, reviewCycle.easy);
});
