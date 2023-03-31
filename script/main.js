const translateButton = document.getElementById("translate-btn");
translateButton.addEventListener("click", translateText);

const apikeyInput = document.getElementById("api-key");
const targetTextarea = document.getElementById("target-text");
const sourceTextarea = document.getElementById("source-text");
// const temperatureInput = document.getElementById("temperature")
const completionInfoElem = document.getElementById("completion-info");
const usageInfoElem = document.getElementById("usage-info");

const languageSelect = document.getElementById("target-lang");
const styleSelect = document.getElementById("style-select");

const settingSaveButton = document.querySelector("#setting-save");
const settingResetButton = document.querySelector("#setting-reset");

function generateOptions(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

/* 言語リスト(select)を生成するやつ */

const languageData = [
    {
        language: "BG",
        name: "Bulgarian",
        supports_formality: false,
    },
    {
        language: "CS",
        name: "Czech",
        supports_formality: false,
    },
    {
        language: "DA",
        name: "Danish",
        supports_formality: false,
    },
    {
        language: "DE",
        name: "German",
        supports_formality: true,
    },
    {
        language: "EL",
        name: "Greek",
        supports_formality: false,
    },
    {
        language: "EN-GB",
        name: "English (British)",
        supports_formality: false,
    },
    {
        language: "EN-US",
        name: "English (American)",
        supports_formality: false,
    },
    {
        language: "ES",
        name: "Spanish",
        supports_formality: true,
    },
    {
        language: "ET",
        name: "Estonian",
        supports_formality: false,
    },
    {
        language: "FI",
        name: "Finnish",
        supports_formality: false,
    },
    {
        language: "FR",
        name: "French",
        supports_formality: true,
    },
    {
        language: "HU",
        name: "Hungarian",
        supports_formality: false,
    },
    {
        language: "ID",
        name: "Indonesian",
        supports_formality: false,
    },
    {
        language: "IT",
        name: "Italian",
        supports_formality: true,
    },
    {
        language: "JA",
        name: "Japanese",
        supports_formality: false,
    },
    {
        language: "KO",
        name: "Korean",
        supports_formality: false,
    },
    {
        language: "LT",
        name: "Lithuanian",
        supports_formality: false,
    },
    {
        language: "LV",
        name: "Latvian",
        supports_formality: false,
    },
    {
        language: "NB",
        name: "Norwegian",
        supports_formality: false,
    },
    {
        language: "NL",
        name: "Dutch",
        supports_formality: true,
    },
    {
        language: "PL",
        name: "Polish",
        supports_formality: true,
    },
    {
        language: "PT-BR",
        name: "Portuguese (Brazilian)",
        supports_formality: true,
    },
    {
        language: "PT-PT",
        name: "Portuguese (European)",
        supports_formality: true,
    },
    {
        language: "RO",
        name: "Romanian",
        supports_formality: false,
    },
    {
        language: "RU",
        name: "Russian",
        supports_formality: true,
    },
    {
        language: "SK",
        name: "Slovak",
        supports_formality: false,
    },
    {
        language: "SL",
        name: "Slovenian",
        supports_formality: false,
    },
    {
        language: "SV",
        name: "Swedish",
        supports_formality: false,
    },
    {
        language: "TR",
        name: "Turkish",
        supports_formality: false,
    },
    {
        language: "UK",
        name: "Ukrainian",
        supports_formality: false,
    },
    {
        language: "ZH",
        name: "Chinese (simplified)",
        supports_formality: false,
    },
];

languageData.forEach((language) => {
    languageSelect.appendChild(
        generateOptions(language.language, language.name)
    );
});

/* スタイルリスト(select)を生成するやつ */

const styleData = [
    { style: "", prompt: "", name: "Default" },
    { style: "novel", prompt: " for the novel", name: "Novel" },
    { style: "twitter", prompt: " for the twitter", name: "Twitter" },
    { style: "wiki", prompt: " for the wiki", name: "Wiki" },
];

styleData.forEach((param) => {
    styleSelect.appendChild(generateOptions(param.style, param.name));
});

// 指定スタイルのプロンプトをgetする
// console.log(getStylePrompt("novel", supportedStyles)); // 出力: " for the novel"
function getStylePrompt(style, styles) {
    const foundStyle = styles.find((item) => item.style === style);
    return foundStyle ? foundStyle.prompt : "";
}

/* translate-btnの制御するやつ */

// sourceTextareが空 or languageSelectがデフォ = disabled
function updateTranslateButton() {
    translateButton.disabled = !(
        sourceTextarea.value.match(/\S/) && languageSelect.value
    );
    // if (sourceTextarea.value.trim() === "" || languageSelect.value === "") {
    //     translateButton.disabled = true;
    // } else {
    //     translateButton.disabled = false;
    // }
}

sourceTextarea.addEventListener("input", updateTranslateButton);
languageSelect.addEventListener("change", updateTranslateButton);

updateTranslateButton();

/* valueの小数点第base位以下を切り捨てする関数 */

function orgFloor(value, base) {
    return Math.floor(value * Math.pow(10, base)) / Math.pow(10, base);
}

function numToMonth(number = 1) {
    // 配列内のインデックスは0から始まるため、1を引く
    number = number - 1;

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    // 配列から対応する月の名前を取得
    const monthName = months[number];

    return monthName;
}

async function updateUsage() {
    placeholder = usageInfoElem.innerHTML;
    usageInfoElem.innerHTML = "...";

    const usage = new openaiUsage(
        `${getLocalStorage([`storage_apikey`]).storage_apikey}`
    );

    try {
        const result = await usage.getMonthUsage();
        usageInfoElem.innerHTML = `Monthly usage for ${numToMonth(
            result.month
        )}: ${orgFloor(result.usageUSD, 4)} USD`;
    } catch (error) {
        console.error(error);
        createNotification(
            "error",
            "Failed to retrieve usage status from OpenAI API.",
            10000,
            true
        );
        usageInfoElem.innerHTML = placeholder;
    }
}

async function translateText() {
    sourceTextarea.removeEventListener("input", updateTranslateButton);
    languageSelect.removeEventListener("change", updateTranslateButton);
    translateButton.disabled = true;

    // const stylePrompt = getStylePrompt(style, styleData);

    //内容の削除
    //TODO:インジケーター表示
    //結果で上書き

    const placeholder = targetTextarea.placeholder;
    const infoText = completionInfoElem.innerHTML;
    targetTextarea.placeholder = "Translating...";
    targetTextarea.value = "";
    completionInfoElem.innerHTML = "...";

    const translator = new Translator(
        "gpt-3.5-turbo-0301",
        `${getLocalStorage([`storage_apikey`]).storage_apikey}`
    );

    try {
        const result = await translator.translate({
            text: sourceTextarea.value,
            targetLang:
                languageSelect.options[languageSelect.selectedIndex].text,
            temperature: 1.0,
            style: styleSelect.value,
        });
        targetTextarea.value = result.text.trim();
        completionInfoElem.innerHTML = `${result.processing_time / 1000} s, ${
            result.total_tokens
        } tokens, ${orgFloor(0.000002 * result.total_tokens, 4)} USD`;
        // , ${orgFloor(0.000002 * result.total_tokens * 130, 3)} JPY
    } catch (error) {
        console.error(error);
        createNotification(
            "error",
            "Translation failed. The API key may not be set up correctly. Please check the console for more information.",
            10000,
            true
        );
        targetTextarea.value = `Error: An error has occurred. Please check the console for details.`;
        completionInfoElem.innerHTML = `${infoText}`;
    }

    targetTextarea.placeholder = `${placeholder}`;

    sourceTextarea.addEventListener("input", updateTranslateButton);
    languageSelect.addEventListener("change", updateTranslateButton);
    updateTranslateButton();
    updateUsage();
}

translateButton.addEventListener("click", translateText);

// ボタンを取得する
const modalBtn = document.querySelector("#modal-btn");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelector("#modal-close");

const modalInDuration = 200;
const modalOutDuration = 200;
const modalInAnimation = `modalFadeIn ${modalInDuration}ms ease-out forwards`;
const modalOutAnimation = `modalFadeOut ${modalOutDuration}ms ease-out forwards`;

// モーダル表示/非表示
modalBtn.addEventListener("click", () => {
    modal.style.display = "block";
    modal.style.animation = `${modalInAnimation}`;
});

closeBtn.addEventListener("click", () => {
    modal.style.animation = `${modalOutAnimation}`;
    setTimeout(() => {
        modal.style.display = "none";
    }, modalOutDuration);
});

// モーダルの外側をクリックしたときにも非表示にする
// window.addEventListener("click", ({ target }) => {
//     if (target === modal) {
//         modal.style.display = "none";
//     }
// });

const defaultSettingsData = {
    storage_isFirstVisit: true,
    storage_apikey: "",
};

function initializeSettings() {
    setLocalStorage(defaultSettingsData);
}

function isFirstVisit() {
    const isFirstVisit = getLocalStorage([
        `storage_isFirstVisit`,
    ]).storage_isFirstVisit;

    if (typeof isFirstVisit !== "boolean") {
        console.log("first visit");
        initializeSettings();
        modal.style.display = "block";
    } else if (isFirstVisit) {
        console.log("first visit (override)");
        initializeSettings();
        modal.style.display = "block";
    } else {
        console.log("not first visit");
        apikeyInput.value = `${
            getLocalStorage([`storage_apikey`]).storage_apikey
        }`;
        updateUsage();
        return;
    }
    createNotification(
        "default",
        "You need to set up your API key before using ChatGPTranslate.",
        10000,
        true
    );
    setLocalStorage({ storage_isFirstVisit: false });
}

isFirstVisit();

settingSaveButton.addEventListener("click", () => {
    const data = {
        storage_apikey: `${apikeyInput.value}`,
    };
    setLocalStorage(data);
    createNotification("success", "Settings have been saved.", 5000, false);
    updateUsage();
});

settingResetButton.addEventListener("click", () => {
    initializeSettings();
    createNotification(
        "success",
        "Settings have been reset. Site will be reloaded in five seconds...",
        5000,
        false
    );
    setTimeout(() => {
        window.location.reload();
    }, 5000);
});
