import { LocalStorageHandler } from "./lib/setting.js";
import { createNotification } from "./lib/notification.js";
import { Translator, openaiUsage } from "./lib/chatcompletion.js";

const lsHandler = new LocalStorageHandler();

//デバッグモード制御
const urlParams = new URLSearchParams(window.location.search);
let debugMode = false;
if (urlParams.has("debug") && urlParams.get("debug") === "true") {
    debugMode = true;
    console.log("Enabled Debug mode.");
}
// 初期化#1(UI生成)

function generateSettingUI() {
    const containers = document.querySelectorAll(".setting-container");

    containers.forEach((container) => {
        const icon = container.dataset.icon;
        const title = container.dataset.title;
        const desc = container.dataset.desc;

        container.innerHTML = `
    <div class="setting-left">
      <div class="setting-emoji">${icon}</div>
      <div class="setting-title">
        <p>${title}</p>
        <p class="setting-desc">${desc}</p>
      </div>
    </div>
    <div class="setting-key">${container.innerHTML.trim()}</div>
  `;

        twemoji.parse(container);
    });
}

generateSettingUI();

const translateButton = document.getElementById("translate-btn");

const apikeyInput = document.querySelector("#api-key");
const targetTextarea = document.querySelector("#target-text");
const sourceTextarea = document.querySelector("#source-text");
// const temperatureInput = document.getElementById("temperature")
const completionInfoElem = document.querySelector("#completion-info");
const usageInfoElem = document.querySelector("#usage-info");

const languageSelect = document.querySelector("#target-lang");
const styleSelect = document.querySelector("#style-select");

const settingSaveButton = document.querySelector("#setting-save");
const settingResetButton = document.querySelector("#setting-reset");

const notificationTestButton = document.getElementById(
    "notification-test-button"
);

// 初期化#2(Select内のOption生成)

/**
 * Creates an HTML option element with the given value and text.
 *
 * @param {string} value - The value of the option.
 * @param {string} text - The text to display for the option.
 * @returns {HTMLOptionElement} The HTML option element.
 */
function createOptions(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}

/**
 * Generates and appends options to a select element based on provided data.
 * @param {Object} params - The parameters for the function.
 * @param {HTMLSelectElement} params.selectElement - The select element to append options to.
 * @param {Array} params.data - An array of objects containing the data to create the options.
 * @param {string} params.dataValueName - The property name for the option value in the data objects.
 * @param {string} params.dataTextName - The property name for the option text in the data objects.
 */
function generateSelectElement({
    selectElement,
    data,
    dataValueName,
    dataTextName,
}) {
    console.log({
        selectElement,
        data,
        dataValueName,
        dataTextName,
    });
    for (let i = 0; i < data.length; i++) {
        const option = createOptions(
            data[i][dataValueName],
            data[i][dataTextName]
        );
        selectElement.appendChild(option);
    }
}

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

generateSelectElement({
    selectElement: languageSelect,
    data: languageData,
    dataValueName: "language",
    dataTextName: "name",
});

const styleData = [
    { style: "", prompt: "", name: "Default" },
    { style: "novel", prompt: " for the novel", name: "Novel" },
    { style: "twitter", prompt: " for the twitter", name: "Twitter" },
    { style: "wiki", prompt: " for the wiki", name: "Wiki" },
];

generateSelectElement({
    selectElement: styleSelect,
    data: styleData,
    dataValueName: "style",
    dataTextName: "name",
});

const promptData = [
    {
        name: "Default",
        value: "default",
        prompt: `Please translate the following text to \${selectedLanguage}.\n----------\n\${sourceText}\n----------\nAnswer:`,
    },
];

// TODO:たぶんもうgetStylePromptは使わない
/**
 * Returns the prompt associated with the given style.
 *
 * @param {string} style - The style to search for in the styles array.
 * @param {Array<{style: string, prompt: string}>} styles - An array of style objects containing style and prompt properties.
 * @returns {string} - The prompt associated with the given style, or an empty string if the style is not found.
 */
function getStylePrompt(style, styles) {
    const foundStyle = styles.find((item) => item.style === style);
    return foundStyle ? foundStyle.prompt : "";
}

// 初期化#3(翻訳実行ボタンの制御)

// sourceTextareが空 or languageSelectがデフォ = disabled
function updateTranslateButton() {
    translateButton.disabled = !(
        sourceTextarea.value.match(/\S/) && languageSelect.value
    );
}

sourceTextarea.addEventListener("input", updateTranslateButton);
languageSelect.addEventListener("change", updateTranslateButton);

updateTranslateButton();

// numberに対して何かをする関数

/**
 * Rounds down a number to a specified number of decimal places.
 * @param {number} value - The number to be rounded down.
 * @param {number} base - The number of decimal places to round down to.
 * @returns {number} The rounded-down number.
 * @example
 * // Returns 3.14
 * orgFloor(3.14159, 2);
 * @example
 * // Returns 123.4
 * orgFloor(123.456, 1);
 */
function orgFloor(value, base) {
    return Math.floor(value * Math.pow(10, base)) / Math.pow(10, base);
}

/**
 * Converts a given number to its corresponding month name.
 * @param {number} number - The number representing the month (1 to 12).
 * @returns {string} The name of the month corresponding to the given number.
 * @example
 * // Returns "January"
 * numToMonth(1);
 * @example
 * // Returns "December"
 * numToMonth(12);
 */
function numToMonth(number) {
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

// usageを更新するための関数

async function updateUsageUI() {
    const placeholder = usageInfoElem.innerHTML;
    usageInfoElem.innerHTML = "...";

    const usage = new openaiUsage(
        `${lsHandler.get([`storage_apikey`]).storage_apikey}`
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

// 翻訳ボタンを押したらテキストを翻訳する処理

translateButton.addEventListener("click", async () => {
    //翻訳ボタンの制御
    sourceTextarea.removeEventListener("input", updateTranslateButton);
    languageSelect.removeEventListener("change", updateTranslateButton);
    translateButton.disabled = true;

    //元のplaceholderとinfoを保存しとく
    //placeholderとcompletionInfoElem更新
    //textarea内のテキストを削除
    const placeholder = targetTextarea.placeholder;
    const infoText = completionInfoElem.innerHTML;
    targetTextarea.placeholder = "Translating...";
    targetTextarea.value = "";
    completionInfoElem.innerHTML = "...";

    const translator = new Translator(
        "gpt-3.5-turbo-0301",
        `${lsHandler.get([`storage_apikey`]).storage_apikey}`
    );

    try {
        // 結果をtargetTextareaとcompletionInfoElemに入れる
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
    } catch (error) {
        // 失敗したら通知投げる
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

    //placeholder更新
    targetTextarea.placeholder = `${placeholder}`;

    //翻訳ボタン制御
    sourceTextarea.addEventListener("input", updateTranslateButton);
    languageSelect.addEventListener("change", updateTranslateButton);
    updateTranslateButton();
    updateUsageUI();
});

// モーダルを制御する処理

const modalBtn = document.querySelector("#modal-btn");
const modal = document.querySelector("#modal");
const closeBtn = document.querySelector("#modal-close");

// アニメーションの実装はnotification.jsを参考にした
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

//モーダルの外側をクリックしたときにも非表示にする
window.addEventListener("click", ({ target }) => {
    if (target === modal) {
        modal.style.animation = `${modalOutAnimation}`;
        setTimeout(() => {
            modal.style.display = "none";
        }, modalOutDuration);
    }
});

// 設定を制御する処理

const defaultSettingsData = {
    storage_isFirstVisit: true,
    storage_apikey: "",
};

// 設定を初期化する関数
function initializeSettings() {
    lsHandler.set(defaultSettingsData);
}

// 初回訪問判定
// TODO:DOMContentLoadedで書き直す
function checkFirstVisit() {
    const isFirstVisit = lsHandler.get([
        "storage_isFirstVisit",
    ]).storage_isFirstVisit;

    if (typeof isFirstVisit !== "boolean" || isFirstVisit) {
        initializeSettings();
        // modal.style.display = "block";
    } else {
        apikeyInput.value = `${
            lsHandler.get(["storage_apikey"]).storage_apikey
        }`;
        updateUsageUI();
        return;
    }

    modalBtn.style.animation = `scaleBeat 1000ms cubic-bezier(.25,.50,0,1) alternate infinite`;
    lsHandler.set({ storage_isFirstVisit: false });
    createNotification(
        "default",
        "You need to set up your API key before using ChatGPTranslate.",
        10000,
        true
    );
    setTimeout(() => {
        modalBtn.style.animation = "none";
    }, 2000 * 7);
}

checkFirstVisit();

// 設定の保存/初期化制御

settingSaveButton.addEventListener("click", () => {
    const data = {
        storage_apikey: `${apikeyInput.value}`,
    };
    lsHandler.set(data);
    createNotification("success", "Settings have been saved.", 5000, false);
    updateUsageUI();
});

settingResetButton.addEventListener("click", () => {
    const resetConfirm = confirm(
        "Are you sure you want to reset settings to their default values? This action cannot be undone."
    );

    if (resetConfirm) {
        initializeSettings();
        createNotification(
            "success",
            "Settings have been reset. Site will be reloaded in five seconds...",
            10000,
            false
        );
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
});

// 通知のテストを制御するボタン
notificationTestButton.addEventListener("click", () => {
    const content = DOMPurify.sanitize(
        document.querySelector("#notification-test-content").value
    );
    const type = document.querySelector("#notification-test-list").options[
        document.querySelector("#notification-test-list").selectedIndex
    ].value;
    const duration = document.querySelector(
        "#notification-test-duration"
    ).value;
    createNotification(type, content, duration, true);
});

//twimoji要処理
document.addEventListener("DOMContentLoaded", () => {
    twemoji.parse(document.body);
    console.log("DOMContentLoaded");
});
