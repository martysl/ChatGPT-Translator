export { LocalStorageHandler };

const data = { keys: ["data1", "data2", "data3"] };

/**
 * A class to interact with the browser's local storage.
 */
class LocalStorageHandler {
    /**
     * Stores data in local storage.
     * @param {Object} data - An object containing key-value pairs to store.
     * @throws {TypeError} If the provided data is not an object.
     */
    set(data) {
        if (typeof data !== "object" || data === null) {
            throw new TypeError("set() expects an object.");
        }
        try {
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
        } catch (error) {
            console.error("Failed to save data to Local Storage.", error);
        }
    }

    /**
     * Retrieves data from local storage.
     * @param {string[]|null} [keys] - An array of keys to retrieve or null to retrieve all data.
     * @returns {Object} An object containing key-value pairs from local storage.
     * @throws {TypeError} If the provided keys are not an array.
     */
    get(keys) {
        if (keys && !Array.isArray(keys)) {
            throw new TypeError("get() expects an array.");
        }
        const data = {};
        try {
            if (!keys) {
                for (const [key, value] of Object.entries(localStorage)) {
                    data[key] = JSON.parse(value);
                }
            } else {
                keys.forEach((key) => {
                    const value = localStorage.getItem(key);
                    if (value !== null) {
                        data[key] = JSON.parse(value);
                    } else {
                        console.warn(
                            `The key "${key}" does not exist in Local Storage.`
                        );
                        return;
                    }
                });
            }
        } catch (error) {
            console.error("Failed to get data from Local Storage.", error);
        }
        return data;
    }

    /**
     * Removes data from local storage.
     * @param {string[]|null} [keys] - An array of keys to remove or null to clear all data.
     * @throws {TypeError} If the provided keys are not an array.
     */
    remove(keys) {
        if (keys && !Array.isArray(keys)) {
            throw new TypeError("remove() expects an array.");
        }
        try {
            if (!keys) {
                localStorage.clear();
            } else {
                keys.forEach((key) => {
                    if (localStorage.getItem(key) !== null) {
                        localStorage.removeItem(key);
                    } else {
                        console.warn(
                            `The key "${key}" does not exist in Local Storage.`
                        );
                    }
                });
            }
        } catch (error) {
            console.error("Failed to remove data from Local Storage.", error);
        }
    }
}
