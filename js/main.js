// js/main.js
import { fetchGithubApi, callGeminiApi } from './api.js';
import { createPrompt } from './prompt.js';
import { DOM, showMessage, setLoading, switchTab, renderPreview, addNewImageInput, toggleModal } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    let tags = new Set();
    
    /**
     * Inisialisasi aplikasi saat halaman selesai dimuat.
     */
    function initializeApp() {
        // Muat token dari localStorage ke input fields
        DOM.githubTokenInput.value = localStorage.getItem("githubApiToken") || "";
        DOM.geminiTokenInput.value = localStorage.getItem("geminiApiKey") || "";
        addNewImageInput(true);

        // Tampilkan modal jika salah satu atau kedua key tidak ada
        if (!localStorage.getItem("githubApiToken") || !localStorage.getItem("geminiApiKey")) {
            toggleModal(true);
        }
    }

    /**
     * Fungsi utama untuk men-generate README.
     */
    async function handleGenerateReadme() {
        const userGeminiKey = localStorage.getItem("geminiApiKey");
        const userGithubKey = localStorage.getItem("githubApiToken");

        if (!userGithubKey || !userGeminiKey) {
            showMessage("error", "GitHub Token dan Gemini API Key diperlukan. Silakan atur di Pengaturan Lanjutan atau pop-up.");
            toggleModal(true); // Tampilkan modal jika key tidak ada
            return;
        }

        const url = DOM.githubUrlInput.value.trim();
        if (!url) return showMessage("error", "URL GitHub tidak boleh kosong.");
        
        const repoPath = parseGithubUrl(url);
        if (!repoPath) return showMessage("error", "Format URL GitHub tidak valid.");

        setLoading(true);
        switchTab("markdown");

        try {
            const [repoDetails, repoTree] = await Promise.all([
                fetchGithubApi(`https://api.github.com/repos/${repoPath}`),
                fetchGithubApi(`https://api.github.com/repos/${repoPath}/git/trees/main?recursive=1`),
            ]);

            const imageUrls = Array.from(document.querySelectorAll(".image-url-input"))
                .map(input => input.value.trim()).filter(Boolean);
            
            const selectedLang = DOM.languageSelect.value;
            
            const prompt = createPrompt(repoDetails, repoTree.tree.map(f => f.path), imageUrls, Array.from(tags), selectedLang);
            
            const generatedReadme = await callGeminiApi(prompt, userGeminiKey);
            
            DOM.readmeOutput.innerHTML = stripMarkdownWrapper(generatedReadme);
            switchTab("preview"); // Langsung pindah ke preview setelah selesai
            showMessage("success", "README.md berhasil dibuat! Cek tab 'Preview' untuk hasilnya.");

        } catch (error) {
            showMessage("error", error.message);
            DOM.readmeOutput.innerText = `# Gagal Membuat README\n\n**Error:** ${error.message}`;
        } finally {
            setLoading(false);
        }
    }

    /**
     * Menyimpan token API ke localStorage.
     * @param {string} key - 'githubApiToken' or 'geminiApiKey'.
     * @param {string} value - The token value.
     * @param {string} name - The display name ('GitHub' or 'Gemini').
     */
    function saveToken(key, value, name) {
        if (value && value.trim()) {
            localStorage.setItem(key, value);
            showMessage("success", `Token API ${name} berhasil disimpan.`);
        } else {
            localStorage.removeItem(key);
            showMessage("info", `Token API ${name} dihapus dari penyimpanan.`);
        }
    }
    
    /**
     * Menambahkan tag baru dari input ke container.
     */
    function addTag() {
        const tagText = DOM.tagsInput.value.trim().toLowerCase();
        if (tagText && !tags.has(tagText)) {
            tags.add(tagText);
            const tagPill = document.createElement("div");
            tagPill.className = "tag-pill";
            tagPill.innerHTML = `<span>${tagText}</span><span class="tag-remove-btn" data-tag="${tagText}">&times;</span>`;
            DOM.tagsContainer.appendChild(tagPill);
        }
        DOM.tagsInput.value = "";
        DOM.tagsInput.focus();
    }

    /**
     * Menghapus wrapper markdown ```markdown ... ``` dari teks.
     * @param {string} text - Teks yang akan dibersihkan.
     * @returns {string} Teks bersih.
     */
    function stripMarkdownWrapper(text) {
        return text.replace(/^```markdown/, "").replace(/```$/, "").trim();
    }

    /**
     * Mengekstrak path 'user/repo' dari URL GitHub.
     * @param {string} url - URL GitHub lengkap.
     * @returns {string|null} Path repo atau null jika tidak valid.
     */
    function parseGithubUrl(url) {
        const match = url.match(/github\.com\/([^\/]+\/[^\/]+)(\/|$)/);
        return match ? match[1].replace(".git", "") : null;
    }

    /**
     * Menyalin teks dari editor ke clipboard.
     */
    function copyToClipboard() {
        let rawText = DOM.readmeOutput.innerText; // Gunakan innerText untuk hasil yang lebih bersih
        try {
            navigator.clipboard.writeText(rawText).then(() => {
                showMessage("success", "Teks berhasil disalin ke clipboard.");
            });
        } catch (err) {
            showMessage("error", "Gagal menyalin teks.");
        }
    }

    // --- Event Listeners ---
    DOM.generateBtn.addEventListener("click", handleGenerateReadme);
    DOM.copyBtn.addEventListener("click", copyToClipboard);
    DOM.addImageBtn.addEventListener("click", () => addNewImageInput(false));
    DOM.tagsInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });
    DOM.addTagBtn.addEventListener("click", addTag);
    DOM.tagsContainer.addEventListener("click", e => {
        if (e.target.classList.contains("tag-remove-btn")) {
            e.target.parentElement.remove();
            tags.delete(e.target.dataset.tag);
        }
    });

    DOM.markdownTab.addEventListener("click", () => switchTab("markdown"));
    DOM.previewTab.addEventListener("click", () => switchTab("preview"));
    
    DOM.saveGithubTokenBtn.addEventListener("click", () => saveToken("githubApiToken", DOM.githubTokenInput.value, "GitHub"));
    DOM.saveGeminiTokenBtn.addEventListener("click", () => saveToken("geminiApiKey", DOM.geminiTokenInput.value, "Gemini"));

    DOM.modalSaveKeysBtn.addEventListener("click", () => {
        const githubKey = DOM.modalGithubTokenInput.value;
        const geminiKey = DOM.modalGeminiTokenInput.value;
        
        saveToken("githubApiToken", githubKey, "GitHub");
        saveToken("geminiApiKey", geminiKey, "Gemini");

        DOM.githubTokenInput.value = githubKey;
        DOM.geminiTokenInput.value = geminiKey;
        
        if (githubKey && geminiKey) {
            toggleModal(false);
        } else {
            showMessage("error", "Kedua API key wajib diisi untuk melanjutkan.");
        }
    });
    DOM.modalCloseBtn.addEventListener("click", () => toggleModal(false));
    
    // --- Run Initialization ---
    initializeApp();
});
