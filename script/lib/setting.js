function setLocalStorage(data) {
    if (typeof data !== "object" || data === null) {
        throw new TypeError("setLocalStorage() expects an object.");
    }
    try {
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    } catch (error) {
        console.error("Failed to save data to Local Storage.", error);
    }
}

function getLocalStorage(keys) {
    if (keys && !Array.isArray(keys)) {
        throw new TypeError("getLocalStorage() expects an array.");
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

function remLocalStorage(keys) {
    if (keys && !Array.isArray(keys)) {
        throw new TypeError("remLocalStorage() expects an array.");
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
