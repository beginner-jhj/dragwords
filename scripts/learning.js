const deckId = new URL(window.location.href).searchParams.get("id");

async function getWords() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      result.decks.forEach((DECK) => {
        if (DECK.id === deckId) {
          const words = DECK.words;

          const offset = new Date().getTimezoneOffset() * 60000;
          const today = new Date(Date.now() - offset);
          today.setHours(0, 0, 0, 0);
          let wordsToLearn = [];
          words.forEach((word) => {
            const reviewDate = new Date(word.reviewDate);
            reviewDate.setHours(0, 0, 0, 0);

            const adjustedReviewDate = new Date(reviewDate - offset);
            adjustedReviewDate.setHours(0, 0, 0, 0);

            if (adjustedReviewDate <= today) {
              wordsToLearn.push(word);
            }
          });

          resolve(wordsToLearn);
        }
      });
    });
  });
}

async function getAllWords() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      const foundDeck = result.decks.find((deck) => deck.id === deckId);
      resolve(foundDeck ? foundDeck.words : []);
    });
  });
}

async function getReviewCycleByLevel(levelName) {
  return new Promise((resolve) => {
    chrome.storage.local.get({ reviewCycle: {} }, (result) => {
      resolve(result.reviewCycle[levelName]);
    });
  });
}

async function changeReviewDate(id, levelName) {
  const reviewCycle = await getReviewCycleByLevel(levelName);
  let words = await getAllWords();

  for (let i = 0; i < words.length; i++) {
    if (words[i].id === id) {
      const offset = new Date().getTimezoneOffset() * 60000;
      const currentReviewDate = new Date(words[i].reviewDate);
      const updatedReviewDate = new Date(currentReviewDate - offset);
      updatedReviewDate.setDate(updatedReviewDate.getDate() + reviewCycle);

      words[i].reviewDate = updatedReviewDate.toISOString();
      break;
    }
  }

  chrome.storage.local.get({ decks: [] }, (result) => {
    const decks = result.decks;
    for (let i = 0; i < decks.length; i++) {
      if (decks[i].id === deckId) {
        decks[i].words = words;
        break;
      }
    }
    chrome.storage.local.set({ decks: decks });
  });
}

function setWordAndTranslationSpanInnertext(word, translation, location) {
  wordSpan.innerText = `${word}`;
  translationSpan.innerText = `${translation}`;
  locationA.innerText = `${location.slice(0, 20)}...`;
  locationA.href = `${location}`;
}

function removeFirstWord(words) {
  const removedWord = words.shift();
  return removedWord.id;
}

function processNextWord(words, currrentWord, levelName) {
  wordsCount++;
  const removedWordId = removeFirstWord(words);

  if (words.length > 0) {
    changeReviewDate(removedWordId, levelName);
    currrentWord = words[0];

    setWordAndTranslationSpanInnertext(
      currrentWord.word,
      currrentWord.translation,
      currrentWord.location
    );
  } else {
    changeReviewDate(removedWordId, levelName);
    modal.style.display = "flex";
    wordsCountSpan.innerText = `${String(wordsCount).padStart(2, "0")}`;
  }
}

const wordSpan = document.getElementById("wordSpan");
const translationSpan = document.getElementById("translationSpan");
const difficultButton = document.getElementById("difficultButton");
const normalButton = document.getElementById("normalButton");
const easyButton = document.getElementById("easyButton");
const modal = document.getElementById("modal");
const wordsCountSpan = document.getElementById("wordsCount");
const locationA = document.getElementById("locationA");
let wordsCount = 0;

document.addEventListener("DOMContentLoaded", async () => {
  let words = await getWords();

  if (words.length === 0) {
    modal.style.display = "flex";
    wordsCountSpan.innerText = `${String(wordsCount).padStart(2, "0")}`;
    return;
  }

  let currrentWord = words[0];
  console.log(currrentWord);
  setWordAndTranslationSpanInnertext(
    currrentWord.word,
    currrentWord.translation,
    currrentWord.location
  );

  difficultButton.innerText = `${await getReviewCycleByLevel("difficult")}d`;
  normalButton.innerText = `${await getReviewCycleByLevel("normal")}d`;
  easyButton.innerText = `${await getReviewCycleByLevel("easy")}d`;

  locationA.addEventListener("click", (e) => {
    window.open(e.target.href, "_blank");
  });

  difficultButton.addEventListener("click", () => {
    processNextWord(words, currrentWord, "difficult");
  });

  normalButton.addEventListener("click", () => {
    processNextWord(words, currrentWord, "normal");
  });

  easyButton.addEventListener("click", () => {
    processNextWord(words, currrentWord, "easy");
  });
});
