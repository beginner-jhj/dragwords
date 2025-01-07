export function createWordContainer(word, translation, idx) {
  const wordContainer = document.createElement("div");
  wordContainer.className = `word-container`;

  const wordSpan = document.createElement("span");
  wordSpan.innerText = `${word}`;
  wordSpan.className = "word-span";
  wordSpan.style.fontSize = "20px";

  const translationSpan = document.createElement("span"); //translation input
  translationSpan.innerText = `${translation}`;
  translationSpan.id = `translationSpan${idx}`;
  translationSpan.className = "word-span";
  translationSpan.style.cursor = "pointer";
  translationSpan.title = "click to change translation";

  const translationInput = document.createElement("input");
  translationInput.style.display = "none";
  translationInput.id = `translationInput${idx}`;
  translationInput.placeholder = "Enter translation";
  translationInput.className = "translation-input";

  wordContainer.appendChild(wordSpan);
  wordContainer.appendChild(translationSpan);
  wordContainer.appendChild(translationInput);

  translationSpan.addEventListener("click", () => {
    document.getElementById(`translationSpan${idx}`).style.display = "none";
    document.getElementById(`translationInput${idx}`).style.display = "block";
    translationInput.value = translationSpan.innerText;
    translationInput.focus();
  });

  const saveChangedTranslation = (changedTranslation) => {
    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const storedWords = result.savedWords;
      let updatedWords = [];
      for (let i = 0; i < storedWords.length; i++) {
        if (storedWords[i].word === word) {
          storedWords[i].translation = `${changedTranslation}`;
        }
        updatedWords.push(storedWords[i]);
      }
      chrome.storage.local.set({ savedWords: updatedWords });
    });
  };

  translationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.target.style.display = "none";
      const changedTranslation = e.target.value;
      const targetTranslationSpan = document.getElementById(
        `translationSpan${idx}`
      );
      targetTranslationSpan.style.display = "block";
      targetTranslationSpan.innerText = `${changedTranslation}`;

      saveChangedTranslation(changedTranslation);
    }
  });

  return wordContainer;
}

export function createCarouselDiv() {
  const carouselDiv = document.createElement("div");
  carouselDiv.className = `carousel-div`;
  return carouselDiv;
}

export function createLastCarouselDiv() {
  const lastCarouselDiv = document.createElement("div");
  lastCarouselDiv.className = `carousel-div`;
  const message = document.createElement("p");
  message.innerText = "Add More!";
  message.className = `message`;
  lastCarouselDiv.appendChild(message);
  return lastCarouselDiv;
}

export function createCarouselTooltip() {
  const carouselTooltip = document.createElement("div");
  carouselTooltip.className = `carousel-tooltip`;
  return carouselTooltip;
}

export function createDeleteWordSpan(wordToDelete) {
  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = `🗑️`;
  deleteSpan.className = `delete-span`;

  deleteSpan.addEventListener("click", () => {
    let filteredWords = [];
    chrome.storage.local.get({ savedWords: [] }, (result) => {
      const SAVED_WORDS = result.savedWords;
      filteredWords = SAVED_WORDS.filter((item) => item.word !== wordToDelete);

      chrome.storage.local.set({ savedWords: filteredWords }, () => {
        console.log(`"${wordToDelete}" is deleted.`);
      });

      document.location.reload();
    });
  });

  return deleteSpan;
}

export function createSelectDeck(deckNamesAndId) {
  const deckSelect = document.createElement("select");
  deckSelect.id = "deckSelect";
  deckSelect.className = "deck-select";

  const titleOption = document.createElement("option");
  titleOption.disabled = true;
  titleOption.selected = true;
  titleOption.hidden = true;
  titleOption.innerText = "Choose a Deck";
  deckSelect.appendChild(titleOption);

  if (deckNamesAndId.length != 0) {
    deckNamesAndId.forEach((deck) => {
      const option = document.createElement("option");
      option.innerText = deck.name;
      option.value = deck.id;
      deckSelect.appendChild(option);
    });
  } else {
    const alertOption = document.createElement("option");
    alertOption.disabled = true;
    alertOption.innerText = "Create a deck!";
    deckSelect.appendChild(alertOption);
  }

  return deckSelect;
}

export function createAddButton(idNumber, deckCount) {
  const button = document.createElement("button");
  button.id = `addButton${idNumber}`;
  button.className = "add-button";
  button.innerText = `+`;
  button.disabled = deckCount === 0 ? true : false;

  return button;
}

export function createDeckNameInput() {
  const deck = document.createElement("div");
  deck.className = "deckname-input-container";

  let deckName;
  const nameInput = document.createElement("input");
  nameInput.placeholder = "Enter deck name";
  nameInput.className = "deckname-input";

  nameInput.addEventListener("input", (e) => {
    deckName = e.target.value;
  });

  const saveDecknameSpan = document.createElement("span");
  saveDecknameSpan.innerText = "✔";
  saveDecknameSpan.className = "save-deckname-span";

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      chrome.storage.local.get({ decks: [] }, (result) => {
        const storedDecks = result.decks;
        const id = idGenerator();
        const newDeck = { name: deckName, words: [], id: id };
        const updatedDeck = [newDeck, ...storedDecks];

        chrome.storage.local.set({ decks: updatedDeck }, () => {
          console.log(`"${deckName}" deck is added.`);
        });

        window.location.reload();
      });
    }
  });

  saveDecknameSpan.addEventListener("click", () => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      const storedDecks = result.decks;
      const id = idGenerator();
      const newDeck = { name: deckName, words: [], id: id };
      const updatedDeck = [newDeck, ...storedDecks];

      chrome.storage.local.set({ decks: updatedDeck }, () => {
        console.log(`"${deckName}" deck is added.`);
      });

      window.location.reload();
    });
  });

  deck.appendChild(nameInput);
  deck.appendChild(saveDecknameSpan);
  return deck;
}

export function createDeck(name, id) {
  const deck = document.createElement("a");
  deck.className = "deck";
  deck.href = `/learning.html?id=${id}`;

  const container = document.createElement("div");
  container.className = "deck-inner-container";

  const nameP = document.createElement("p");
  nameP.className = "deckname-p";
  nameP.innerText = name;

  const wordsCountSpan = document.createElement("span");
  wordsCountSpan.className = "words-count-span";

  const deckDeleteSpan = document.createElement("span");
  deckDeleteSpan.innerText = "🗑️";
  deckDeleteSpan.className = "delete-span";

  chrome.storage.local.get(["decks"], (result) => {
    const decks = result.decks;
    for (let i = 0; i < decks.length; i++) {
      if (decks[i].id === id) {
        const words = decks[i].words;

        const offset = new Date().getTimezoneOffset() * 60000;
        const today = new Date(Date.now() - offset);
        today.setHours(0, 0, 0, 0);
        let wordsCount = 0;
        words.forEach((word) => {
          const reviewDate = new Date(word.reviewDate);
          reviewDate.setHours(0, 0, 0, 0);

          const adjustedReviewDate = new Date(reviewDate - offset);
          adjustedReviewDate.setHours(0, 0, 0, 0);

          if (adjustedReviewDate <= today) {
            wordsCount++;
          }
        });
        wordsCountSpan.innerText = `${String(wordsCount).padStart(2, "0")}`;
      }
    }
  });

  deckDeleteSpan.addEventListener("click", () => {
    chrome.storage.local.get({ decks: [] }, (result) => {
      const filteredDecks = result.decks.filter((deck) => deck.id !== id);
      chrome.storage.local.set({ decks: filteredDecks }, () => {
        console.log(`"${name}" decks is deleted.`);
      });
      window.location.reload();
    });
  });

  container.appendChild(nameP);
  container.appendChild(wordsCountSpan);

  deck.appendChild(container);
  deck.appendChild(deckDeleteSpan);
  return deck;
}
