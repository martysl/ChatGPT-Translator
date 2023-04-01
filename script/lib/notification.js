export { createNotification };

/**
 * Returns the current time as a formatted string.
 *
 * @returns {string} A string representing the current time in the format "HH:MM:SS".
 */
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Creates a notification with the given type, message, duration, and closeButton options.
 *
 * @param {string} [type='default'] - The type of the notification ('success', 'warning', 'error', or 'default').
 * @param {string} [message='Notification content'] - The content of the notification.
 * @param {number} [duration=5000] - The duration of the notification in milliseconds.
 * @param {boolean} [closeButton=false] - Whether the notification should have a close button.
 * @returns {void}
 */
function createNotification(
    type = "default",
    message = "Notification content",
    duration = 5000,
    closeButton = false
) {
    // 通知要素を作成
    const notification = document.createElement("div");
    notification.classList.add("notification");

    // アイコンと色を設定
    let icon;
    let color;
    let notificationClass;
    switch (type) {
        case "success":
            icon = `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"></path>
          </svg>`;
            color = "green";
            notificationClass = "success";
            break;
        case "warning":
            icon = `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"></path>
          </svg>`;
            color = "yellow";
            notificationClass = "warning";
            break;
        case "error":
            icon = `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"></path>
          </svg>`;
            color = "red";
            notificationClass = "error";
            break;
        default:
            icon = `<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z"></path>
          </svg>`;
            color = "white";
            notificationClass = "default";
    }

    // 通知に適切なクラスを追加
    notification.classList.add(notificationClass);

    // ×ボタンのHTMLを生成
    const closeButtonHtml = closeButton
        ? '<button class="close-button">&times;</button>'
        : "";

    // 通知の内容を設定
    notification.innerHTML = `<span class="notification-icon ${type}">${icon}</span><p>${message}</br><span class="notification-time"><time class="notification-time" datetime="${getCurrentTime()}">${getCurrentTime()}</time></span></p>${closeButtonHtml}`;

    // 通知コンテナに追加
    const container = document.getElementById("notification-container");
    container.appendChild(notification);

    const fadeinDuration = 750;
    const fadeoutDuration = 500;
    const fadeinAnimation = `fadeIn ${fadeinDuration}ms cubic-bezier(.25,.50,0,1) forwards`;
    const fadeoutAnimation = `fadeOut ${fadeoutDuration}ms cubic-bezier(.25,.50,0,1) forwards`;

    // 出現アニメーションを設定
    notification.style.animation = `${fadeinAnimation}`;

    twemoji.parse(notification);

    let isRemoved = false;

    // ×ボタンがある場合、クリックイベントを追加
    if (closeButton) {
        const closeButtonElement = notification.querySelector(".close-button");
        closeButtonElement.addEventListener("click", () => {
            notification.style.animation = `${fadeoutAnimation}`;
            setTimeout(() => {
                isRemoved = true;
                container.removeChild(notification);
            }, fadeoutDuration);
        });
    }

    // 指定時間後に退出アニメーションを設定
    setTimeout(() => {
        notification.style.animation = `${fadeoutAnimation}`;
    }, duration - fadeoutDuration); // 500ミリ秒はfadeOutアニメーションの時間

    // 指定時間後に通知を削除
    setTimeout(() => {
        if (isRemoved) return;
        container.removeChild(notification);
    }, duration);
}

/**
 * Shows a random notification with a random type, a random duration, and a random close button option. The function schedules the next notification to appear after a random interval of time.
 *
 * @returns {void}
 */
// ランダムな通知を表示する関数（デモ用）
function showRandomNotification() {
    // 通知の種類
    const notificationTypes = ["default", "success", "warning", "error"];

    // ×ボタンの有無
    const closeButtonOptions = [true, false];

    // 同時に表示する通知の数をランダムに選択（1～2）
    const randomNotificationCount = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < randomNotificationCount; i++) {
        // ランダムな通知の種類と×ボタンの有無を選択
        const randomType =
            notificationTypes[
                Math.floor(Math.random() * notificationTypes.length)
            ];
        const randomCloseButton =
            closeButtonOptions[
                Math.floor(Math.random() * closeButtonOptions.length)
            ];

        // 通知を表示
        createNotification(
            randomType,
            `${randomType} notification`,
            5000,
            randomCloseButton
        );
    }

    // 次の通知を表示するまでのランダムな時間を設定（1000ms～4000ms）
    const randomInterval = 2000 + Math.floor(Math.random() * 3000);

    // 次の通知をスケジュール
    setTimeout(showRandomNotification, randomInterval);
}
