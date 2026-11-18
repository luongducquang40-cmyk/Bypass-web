// Sử dụng API bypass công cộng
const API_URLS = [
    "https://api.bypass.city/bypass?url=",
    "https://api.bypass.vip/bypass?url="
];

async function startBypass() {
    const urlInput = document.getElementById("urlInput").value.trim();
    if (!urlInput) return alert("Vui lòng nhập link!");

    toggleUI(true);

    let success = false;
    let realLink = "";

    // Thử từng API
    for (let api of API_URLS) {
        try {
            const response = await fetch(api + encodeURIComponent(urlInput));
            if (response.ok) {
                const data = await response.json();
                // Tùy API trả về result hoặc url
                if (data.status === "success" || data.success === true) {
                    realLink = data.result || data.url;
                    success = true;
                    break;
                }
            }
        } catch (e) {
            console.log("API lỗi, thử cái tiếp theo...");
        }
    }

    // Nếu không API nào chạy được, trả về link gốc (fallback)
    if (!success) {
        // Thử lấy link nếu người dùng nhập sai (link gốc không qua rút gọn)
        if (urlInput.startsWith("http")) {
             realLink = urlInput + " (Không thể vượt qua tự động, có thể đây là link gốc)";
             success = true;
        }
    }

    toggleUI(false);

    if (success) {
        showResult(realLink);
    } else {
        showError();
    }
}

function toggleUI(isLoading) {
    const btn = document.getElementById("bypassBtn");
    const btnText = document.getElementById("btnText");
    const loader = document.getElementById("loader");
    const resultBox = document.getElementById("resultBox");
    const errorBox = document.getElementById("errorBox");

    if (isLoading) {
        btn.disabled = true;
        btnText.textContent = "ĐANG XỬ LÝ...";
        loader.classList.remove("hidden");
        resultBox.classList.add("hidden");
        errorBox.classList.add("hidden");
    } else {
        btn.disabled = false;
        btnText.textContent = "VƯỢT LINK";
        loader.classList.add("hidden");
    }
}

function showResult(link) {
    document.getElementById("resultBox").classList.remove("hidden");
    document.getElementById("realLink").value = link;
    
    const dlBtn = document.getElementById("downloadBtn");
    if (link.startsWith("http") && !link.includes("Không thể")) {
        dlBtn.href = link;
        dlBtn.classList.remove("hidden");
    } else {
        dlBtn.classList.add("hidden");
    }
}

function showError() {
    document.getElementById("errorBox").classList.remove("hidden");
}

function copyLink() {
    const copyText = document.getElementById("realLink");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    
    const btn = document.getElementById("copyBtn");
    btn.textContent = "ĐÃ COPY";
    setTimeout(() => { btn.textContent = "COPY"; }, 2000);
}
