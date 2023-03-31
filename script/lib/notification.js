function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

// 通知を生成する関数
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
            icon = "✅";
            color = "green";
            notificationClass = "notification-success";
            break;
        case "warning":
            icon = "⚠️";
            color = "yellow";
            notificationClass = "notification-warning";
            break;
        case "error":
            icon = "❌";
            color = "red";
            notificationClass = "notification-error";
            break;
        default:
            icon = "🔔";
            color = "white";
            notificationClass = "notification-default";
    }

    // 通知に適切なクラスを追加
    notification.classList.add(notificationClass);

    // ×ボタンのHTMLを生成
    const closeButtonHtml = closeButton
        ? '<button class="close-button">&times;</button>'
        : "";

    // 通知の内容を設定
    notification.innerHTML = `<span class="notification-icon">${icon}</span> <p>${message}</p><time class="notification-time" datetime="${getCurrentTime()}">${getCurrentTime()}</time> ${closeButtonHtml}`;

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

// 通知の種類
const notificationTypes = ["default", "success", "warning", "error"];

// ×ボタンの有無
const closeButtonOptions = [true, false];

// ランダムな通知を表示する関数（デモ用）
function showRandomNotification() {
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
