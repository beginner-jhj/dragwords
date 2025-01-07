import {
  createWordContainer,
  createCarouselDiv,
  createLastCarouselDiv,
  createCarouselTooltip,
  createDeleteWordSpan,
  createSelectDeck,
  createAddButton,
  createDeckNameInput,
  createDeck,
} from "./create-element.js";

const addedWordCarousel = document.getElementById("addedWordCarousel");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const createDeckButton = document.getElementById("createDeckButton");
const deckContainer = document.getElementById("deckContainer");

let selectedDeckId = null;
let count = 0;

function getAddedWords() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ savedWords: [] }, (result) => {
      resolve(result.savedWords);
    });
  });
}

function getDecks() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      resolve(result.decks.reverse());
    });
  });
}

function getDeckNamesAndId() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      const namesAndIds = result.decks.map((DECK) => ({
        name: DECK.name,
        id: DECK.id,
      }));
      resolve(namesAndIds.reverse());
    });
  });
}

function initReviewCycle() {
  chrome.storage.local.get({ reviewCycle: {} }, (result) => {
    if (Object.keys(result.reviewCycle).length === 0) {
      const initiatedReviewCycle = {
        difficult: 1,
        normal: 4,
        easy: 7,
      };
      chrome.storage.local.set({ reviewCycle: initiatedReviewCycle });
    }
  });
}

function initDefaultTargetLang() {
  chrome.storage.local.get({ defaultTargetLang: "" }, (result) => {
    if (result.defaultTargetLang.length === 0) {
      const browserLanguage = navigator.language;

      const initiatedDefaultTargetLang = browserLanguage
        .slice(0, 2)
        .toUpperCase();
      chrome.storage.local.set({
        defaultTargetLang: initiatedDefaultTargetLang,
      });
    }
  });
}

function setCarouselDiv({
  word,
  index,
  location,
  translation,
  deckNamesAndIds,
}) {
  const carouselDiv = createCarouselDiv();
  const wordContainer = createWordContainer(word, translation, index);
  const carouselTooltip = createCarouselTooltip();
  const deleteWordSpan = createDeleteWordSpan(word);
  const selectDeck = createSelectDeck(deckNamesAndIds);
  const addButton = createAddButton(index, deckNamesAndIds.length);

  selectDeck.addEventListener("change", (e) => {
    selectedDeckId = e.target.value;
  });

  addButton.addEventListener("click", () => {
    const idGenerator = () => {
      var S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return (
        S4() +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        S4() +
        S4()
      );
    };
    if (selectedDeckId) {
      chrome.storage.local.get({ decks: [] }, (result) => {
        const storedDecks = result.decks;
        let updatedDecks = [];
        for (let i = 0; i < storedDecks.length; i++) {
          if (storedDecks[i].id === selectedDeckId) {
            const offset = new Date().getTimezoneOffset() * 60000;
            const today = new Date(Date.now() - offset);
            storedDecks[i].words.push({
              id: idGenerator(),
              word: word,
              translation: translation,
              location: location,
              reviewDate: today.toISOString(),
            });
          }
          updatedDecks.push(storedDecks[i]);
        }
        chrome.storage.local.set({ decks: updatedDecks });
        deleteWordSpan.click();
      });
    }
  });

  carouselTooltip.appendChild(deleteWordSpan);
  carouselTooltip.appendChild(selectDeck);
  carouselTooltip.appendChild(addButton);

  carouselDiv.appendChild(wordContainer);
  carouselDiv.appendChild(carouselTooltip);

  return carouselDiv;
}

document.addEventListener("DOMContentLoaded", async () => {
  initReviewCycle();
  initDefaultTargetLang();

  const addedWords = await getAddedWords();
  const decks = await getDecks();
  const deckNamesAndIds = await getDeckNamesAndId();
  addedWordCarousel.style.width = `${(addedWords.length + 1) * 216}px`;

  prevButton.addEventListener("click", () => {
    if (count <= 0) return;
    count--;
    addedWordCarousel.style.transform = `translateX(${-216 * count}px)`;
  });

  nextButton.addEventListener("click", () => {
    if (count >= addedWords.length) return;
    count++;
    addedWordCarousel.style.transform = `translateX(${-216 * count}px)`;
  });

  createDeckButton.addEventListener("click", () => {
    const deckNameInput = createDeckNameInput();
    deckContainer.appendChild(deckNameInput);
  });

  addedWords.forEach((item, idx) => {
    const carouselDiv = setCarouselDiv({
      word: item.word,
      translation: item.translation,
      location: item.location,
      index: idx,
      deckNamesAndIds: deckNamesAndIds,
    });
    addedWordCarousel.appendChild(carouselDiv);
  });

  const lastCarouselDiv = createLastCarouselDiv();
  addedWordCarousel.appendChild(lastCarouselDiv);

  decks.forEach((DECK) => {
    const deck = createDeck(DECK.name, DECK.id);
    deckContainer.appendChild(deck);
  });
});
