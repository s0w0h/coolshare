document.addEventListener("DOMContentLoaded", () => {
    const codeInput = document.getElementById("code-input");
    const customCodeInput = document.getElementById("custom-code");
    const timeSelect = document.getElementById("time-select");
    const customTimeInput = document.getElementById("custom-time");
    const shareButton = document.getElementById("share-button");
    const resultDiv = document.getElementById("result");
    const shareLinkSpan = document.getElementById("share-link");
    const countdownSpan = document.getElementById("countdown");
    const copyButton = document.getElementById("copy-button");
    const jumpForm = document.getElementById("jump-form");
    const shareCodeInput = document.getElementById("share-code-input");
    const destroyButtonTrigger = document.getElementById('destroy-button-trigger');
    
    let countdownInterval;

    timeSelect.addEventListener("change", () => {
        customTimeInput.style.display = timeSelect.value === "custom" ? "inline-block" : "none";
    });

    jumpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const shareCode = shareCodeInput.value.trim();
        if (shareCode) {
            window.location.href = `/${shareCode}`;
        }
    });

    function adjustHeight() {
        codeInput.style.height = 'auto';
        const scrollHeight = codeInput.scrollHeight;
        codeInput.style.height = Math.min(Math.max(scrollHeight, 300), 700) + 'px';
    }
    codeInput.addEventListener('input', adjustHeight);
    adjustHeight(); // 初始调整
    window.addEventListener('resize', adjustHeight);

    shareButton.addEventListener("click", async () => {
        const code = codeInput.value.trim();
        if (!code) {
            alert("请输入代码或文本片段");
            return;
        }

        const customCode = customCodeInput.value.trim();
        let shareTime;
        if (timeSelect.value === "custom") {
            shareTime = parseInt(customTimeInput.value);
            if (!Number.isInteger(shareTime) || shareTime <= 0) {
                alert("自定义时间超出设置范围，请联系管理员");
                return;
            }
        } else {
            shareTime = parseInt(timeSelect.value);
        }

        try {
            shareButton.disabled = true;
            const response = await fetch("/share", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, customCode, shareTime }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    alert("操作超限，请稍后再试");
                    return;
                }

                const data = await response.json();
                alert(`分享失败: ${data.error || response.statusText}`);
                return;
            }

            const data = await response.json();
            const shareCode = data.share_code;
            const shareLink = `${window.location.origin}/${shareCode}`;

            // 清除之前的倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }

            shareLinkSpan.textContent = shareLink;
            startCountdown(shareTime * 60);
            resultDiv.classList.remove("hidden");

        } catch (error) {
            console.error("Error:", error);
            alert("分享失败，请稍后再试: " + error);
        } finally {
            shareButton.disabled = false;
        }
    });

    if (ClipboardJS.isSupported()) {
        const clipboard = new ClipboardJS("#copy-button");
        const copyMessage = document.getElementById("copy-message");
        clipboard.on("success", function (e) {
            copyMessage.textContent = "已复制到剪贴板";
            copyMessage.classList.add("success-message");
            copyMessage.classList.remove("error-message");
            copyMessage.style.display = "block";
            setTimeout(() => {
                copyMessage.style.display = "none";
            }, 2000);
        });
        clipboard.on("error", function (e) {
            copyMessage.textContent = "复制失败，请手动复制";
            copyMessage.classList.add("error-message");
            copyMessage.classList.remove("success-message");
            copyMessage.style.display = "block";

        });
    } else {
        console.error("ClipboardJS not supported in this browser.");
    }

    destroyButtonTrigger.addEventListener("click", async () => {
        if (!confirm("确定要销毁吗？")) {
            return;
        }
        if (!confirm("此操作不可逆！")) {
            return;
        }

        const shareCode = shareLinkSpan.textContent.split("/").pop();

        try {
            const response = await fetch("/destroy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ share_code: shareCode }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    alert("操作超限，请稍后再试");
                    return;
                }
                const data = await response.json();
                alert(`销毁失败: ${data.error || response.statusText}`);
                return;
            }
            alert("代码片段已销毁");
            resultDiv.classList.add("hidden");
            codeInput.value = "";
            codeInput.dispatchEvent(new Event('input'));

        } catch (error) {
            console.error("Error:", error);
            alert("销毁失败，请稍后再试: " + error);
        }
    });

    function startCountdown(remainingTime) {
        const updateCountdown = () => {
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            countdownSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                countdownSpan.textContent = "已过期";
            }

            remainingTime--;
        };

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    }
});