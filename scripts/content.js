function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.id = "dragWordsTooltip";
  document.body.appendChild(tooltip);

  const tooltipStyle = document.createElement("style");
  tooltipStyle.innerHTML = `
  #dragWordsTooltip {
    width:200px;
    height:80px;
    box-sizing: border-box;
    display: none;
    position: absolute;
    flex-direction: column;
    justify-content:space-around;
    align-items:center;
    background-color: white;
    color: #FF9800;
    padding:3px;
    border-radius: 5px;
    border:1px solid #FF9800;
    z-index: 10000;
  }
`;

  document.head.appendChild(tooltipStyle);
  return tooltip;
}

let TRANSLATION = null;

function createAddButton() {
  const addButton = document.createElement("button");
  addButton.id = "addButton";
  addButton.innerText = "Add";

  addButton.addEventListener("click", async () => {
    const selectedText = window.getSelection().toString().trim();
    const alertMessage = createAlertMessage(selectedText);

    if (selectedText) {
      const translation = TRANSLATION || (await getTranslation(selectedText));
      saveWordToStorage(selectedText, translation);

      setTimeout(() => {
        alertMessage.style.display = "none";
      }, 1200);
    }
    addButton.parentElement.style.display = "none";
  });

  const addButtonStyle = document.createElement("style");
  addButtonStyle.innerHTML = `
    #addButton{
      font-size: 12px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight:600;
      background-color: white;
      color: #FF9800;
      border-radius: 5px;
      border:1px solid #FF9800;
      padding:2px;
      cursor:pointer;
    }
  `;

  document.head.appendChild(addButtonStyle);
  return addButton;
}

function createTranslationDiv() {
  const translationDiv = document.createElement("div");
  translationDiv.id = "translationDiv";

  const seeTranslationButton = document.createElement("button");
  seeTranslationButton.id = "seeTranslationButton";
  seeTranslationButton.innerText = "Translate";

  const loader = document.createElement("div");
  loader.id = "loader";

  translationDiv.appendChild(seeTranslationButton);

  const translationDivStyle = document.createElement("style");
  translationDivStyle.innerHTML = `
    #translationDiv{
      display:flex;
      width:200px;
      height:60px;
      justify-content:center;
      align-items:center;
    }

    #seeTranslationButton{
      font-size:18px;
      cursor:pointer;
      font-weight:600;
      border:none;
      color: #FF9800;
    }

    #loader {
    border: 2px solid #f3f3f3; /* Light grey */
    border-top: 2px solid #FF9800; /* Blue */
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
    }

    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }
  `;

  seeTranslationButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      seeTranslationButton.style.display = "none";
      loader.style.display = "block";
      translationDiv.appendChild(loader);
      TRANSLATION = await getTranslation(selectedText);
      loader.style.display = "none";
      seeTranslationButton.style.display = "block";

      seeTranslationButton.innerText =
        TRANSLATION != null ? `${TRANSLATION}` : "Oops.. something went wrong";
    }
  });

  document.head.appendChild(translationDivStyle);

  return translationDiv;
}

function createAlertMessage(word) {
  const alertMessage = document.createElement("div");
  alertMessage.id = "dragWordsAlertMessage";
  alertMessage.innerText = `"${word}" is added!`;
  document.body.appendChild(alertMessage);

  const alertMessageStyle = document.createElement("style");
  alertMessageStyle.innerHTML = `
  #dragWordsAlertMessage{
    display:block;
    position:fixed;
    top:0;
    right:5%;
    background-color:white;
    box-shadow: 0px 8px 6px -6px #666;
    color:#FF9800;
    padding:5px;
    border-radius:5px;
    font-size:17px;
    z-index:10000;
    }
  `;
  document.head.appendChild(alertMessageStyle);
  return alertMessage;
}

function getDefaultTargetlang() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ defaultTargetLang: "" }, (result) => {
      resolve(result.defaultTargetLang);
    });
  });
}

async function getTranslation(sourceText) {
  try {
    const defaultTargetLang = await getDefaultTargetlang();
    const response = await fetch(
      "https://dragwords-translator.netlify.app/.netlify/functions/index/translate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceText: sourceText,
          targetLang: defaultTargetLang,
        }),
      }
    );
    const { translation, serverError } = await response.json();

    if (serverError !== null) {
      throw new Error(serverError);
    }
    return translation;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function saveWordToStorage(word, translation) {
  chrome.storage.local.get({ savedWords: [] }, (result) => {
    const storedWords = result.savedWords;
    const updatedWords = [
      { word: word, translation: translation, location: window.location.href },
      ...storedWords,
    ];
    chrome.storage.local.set({ savedWords: updatedWords }, () => {
      console.log(`"${word}" saved to storage.`);
    });
  });
}

const tooltip = createTooltip();
const translationDiv = createTranslationDiv();
const addButton = createAddButton();

tooltip.appendChild(translationDiv);
tooltip.appendChild(addButton);

document.addEventListener("selectionchange", async () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    TRANSLATION = null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;
    tooltip.style.display = "flex";
    translationDiv.childNodes[0].innerText = "Translate";
  } else {
    tooltip.style.display = "none";
  }
});
