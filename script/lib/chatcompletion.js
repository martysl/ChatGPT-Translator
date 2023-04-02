export { Translator, openaiUsage };

/**
 * ChatCompletion class for interacting with the OpenAI API.
 */
class ChatCompletion {
    /**
     * Create a ChatCompletion instance.
     * @param {string} model - The name of the model to use for generating responses.
     * @param {string} apiKey - The API key for authenticating with the OpenAI API.
     */
    constructor(model, apiKey) {
        this.model = model;
        this.apiKey = apiKey;
        this.url = "https://api.openai.com/v1/chat/completions";
    }

    /**
     * Create a chat completion.
     * @async
     * @param {Object} options - The options for the chat completion.
     * @param {string} [options.sysPrompt=""] - The system prompt to set the behavior of the AI.
     * @param {string} options.prompt - The user input prompt for the AI to respond to.
     * @param {number} [options.temperature=1] - Controls the randomness of the AI's response (0 to 1).
     * @param {string} [options.stop=""] - The stopping sequence for the AI's response.
     * @returns {Promise<Object>} An object containing the generated `text`, `total_tokens`, and `processing_time`.
     * @throws {Error} If any of the arguments are invalid or if there is an error in communication with the API.
     */
    async create({ sysPrompt = "", prompt, temperature = 1, stop = "" }) {
        if (
            typeof sysPrompt !== "string" ||
            !prompt ||
            typeof prompt !== "string" ||
            !temperature ||
            typeof temperature !== "number" ||
            temperature < 0 ||
            temperature > 1
        ) {
            throw new Error("Invalid arguments.");
        }
        console.log("Prompt:");
        console.log({ temperature, stop, sysPrompt, prompt });

        const startTime = Date.now();
        try {
            const response = await fetch(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    temperature: temperature,
                    messages: [
                        { role: "system", content: sysPrompt },
                        { role: "user", content: prompt },
                    ],
                    stop: stop,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMessage = result?.error?.message || "Unknown error";
                // console.error(`Status code: ${response.status}`);
                if (response.status === 401) {
                    throw new Error(
                        `Failed to fetch from OpenAI API (Is the API key correctly configured?): \n${errorMessage}`
                    );
                }
                throw new Error(
                    `Failed to fetch from OpenAI API: \n${errorMessage}`
                );
            }

            const endTime = Date.now();
            const elapsedTime = endTime - startTime;

            console.log(
                `Finish reason:${result.choices[0].finish_reason} Total tokens: ${result.usage.total_tokens}\nResult(${elapsedTime} ms):`
            );
            console.log(result.choices[0].message.content);

            return {
                text: `${result.choices[0].message.content}`,
                total_tokens: result.usage.total_tokens,
                processing_time: elapsedTime,
            };

            // return result.choices[0].message.content;
        } catch (error) {
            //console.error(error);
            //throw new Error(`Failed to communicate with the server. ${error}`);
            throw error;
        }
    }
}

/**
 * Translator class for translating text using the ChatCompletion class with the OpenAI API.
 * @extends ChatCompletion
 */
class Translator extends ChatCompletion {
    /**
     * Translate a given text to the target language using the OpenAI API.
     * @async
     * @param {Object} options - The options for the translation.
     * @param {string} options.text - The text to be translated.
     * @param {string} options.targetLang - The target language for the translation.
     * @param {number} [options.temperature=1] - Controls the randomness of the AI's response (0 to 1).
     * @param {string} [options.style=""] - The style of the text to be translated.
     * @param {string} [options.overridePrompt] - Optional custom prompt for the AI.
     * @returns {Promise<Object>} An object containing the translated `text`, `total_tokens`, and `processing_time`.
     * @throws {Error} If any of the arguments are invalid or if there is an error in communication with the API.
     */
    async translate({
        text,
        targetLang,
        temperature = 1,
        style = "",
        overridePrompt,
    }) {
        if (
            !text ||
            typeof text !== "string" ||
            !targetLang ||
            typeof targetLang !== "string" ||
            typeof temperature !== "number" ||
            temperature < 0 ||
            temperature > 1
        ) {
            throw new Error("Invalid arguments.");
        }

        console.log(`Target langage: ${targetLang}\nStyle: ${style}`);
        const prompt = overridePrompt
            ? overridePrompt
            : `You are a great translator and a native ${targetLang} speaker.\nThe following is a part of the ${style} text. Please translate the following text to ${targetLang} for the ${style} text. Insert [TRANSLATE.DONE] at the end\n\nText\n----------\n${text}\n---------\n\nTranslated text\n---------`;

        const response = await this.create({
            prompt: prompt,
            stop: "[TRANSLATE.DONE]",
        });
        return response;
    }
}

/**
 * Class representing usage of the OpenAI API.
 */
class openaiUsage {
    /**
     * Create an openaiUsage instance.
     * @param {string} apiKey - The API key for the OpenAI API.
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.url = "https://api.openai.com/dashboard/billing/usage";
    }

    /**
     * Fetches and returns the usage data for the current month.
     * @async
     * @returns {Promise<Object>} An object containing the `usage` in USD, `year`, and `month`.
     * @throws {Error} Throws an error if the API call fails.
     */
    async getMonthUsage() {
        const date = new Date(Date.now());
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const nextMonth = month + 1;
        const start_date = `${year}-${month}-01`;
        const end_date = `${year + Math.floor(month / 12)}-${
            nextMonth % 12
        }-01`;

        console.log({ date, year, month, nextMonth, start_date, end_date });

        try {
            const response = await fetch(
                `${this.url}?start_date=${start_date}&end_date=${end_date}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                }
            );

            const result = await response.json();
            if (!response.ok) {
                const errorMessage = result?.error?.message || "Unknown error";
                // console.error(`Status code: ${response.status}`);
                if (response.status === 401) {
                    throw new Error(
                        `Failed to fetch from OpenAI API (Is the API key correctly configured?): \n${errorMessage}`
                    );
                }
                throw new Error(
                    `Failed to fetch from OpenAI API: \n${errorMessage}`
                );
            }

            console.log({
                usageUSD: result.total_usage / 100,
                year: year,
                month: month,
            });

            return {
                usageUSD: result.total_usage / 100,
                year: year,
                month: month,
            };
        } catch (error) {
            throw error;
        }
    }
}
