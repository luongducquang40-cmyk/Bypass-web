// Sử dụng API miễn phí không cần key từ iwoozie.baby
const API_URL = "https://iwoozie.baby/api/bypass?url=";

async function startBypass() {
    const urlInput = document.getElementById("urlInput").value.trim();
    if (!urlInput) return alert("Vui lòng nhập link!");

    toggleUI(true);

    let success = false;
    let realLink = "";

    try {
        // Gọi API bypass
        const response = await fetch(API_URL + encodeURIComponent(urlInput), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Kiểm tra cấu trúc trả về (có thể là result, url, hoặc destination)
            if (data.result) {
                realLink = data.result;
                success = true;
            } else if (data.url) {
                realLink = data.url;
                success = true;
            } else if (data.destination) {
                realLink = data.destination;
                success = true;
            } else if (typeof data === 'string' && data.startsWith('http')) {
                realLink = data;
                success = true;
            }
        }
    } catch (e) {
        console.log("API lỗi:", e);
    }

    // Fallback: Nếu API không trả về, thử dùng phương pháp Scraping cơ bản (nếu link là link4m/link1s)
    if (!success && (urlInput.includes('link4m') || urlInput.includes('link1s'))) {
        realLink = await fallbackScrape(urlInput);
        if (realLink) success = true;
    }

    toggleUI(false);

    if (success && realLink) {
        showResult(realLink);
    } else {
        showError();
    }
}

// Hàm dự phòng cho một số trang rút gọn đơn giản
async function fallbackScrape(url) {
    try {
        // Sử dụng một proxy CORS công cộng để lấy HTML
        const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        const html = await res.text();
        
        // Tìm link trong thẻ meta refresh
        const metaMatch = html.match(/http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)/i);
        if (metaMatch) return metaMatch[1];

        // Tìm link trong các thẻ a có chứa download/get link
        const linkMatch = html.match(/<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>.*?(?:download|get link|tải)/i);
        if (linkMatch) return linkMatch[1];

    } catch (e) {
        console.log("Fallback lỗi:", e);
    }
    return null;
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
    if (link.startsWith("http")) {
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
