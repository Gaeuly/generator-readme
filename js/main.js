// js/main.js
import { fetchGithubApi, callGeminiApi } from './api.js';
import { createPrompt } from './prompt.js';
import { DOM, showMessage, setLoading, switchTab, renderPreview, addNewImageInput } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    let tags = new Set();
    
    // --- Initialization ---
    addNewImageInput(true);
    // (Logika modal dan token bisa ditambahkan di sini jika diperlukan)

    // --- Event Listeners ---
    DOM.generateBtn.addEventListener("click", handleGenerateReadme);
    DOM.copyBtn.addEventListener("click", copyToClipboard);
    DOM.addImageBtn.addEventListener("click", () => addNewImageInput(false));
    DOM.tagsInput.addEventListener("keydown", handleTagInput);
    DOM.tagsContainer.addEventListener("click", handleTagRemove);
    DOM.markdownTab.addEventListener("click", () => switchTab("markdown"));
    DOM.previewTab.addEventListener("click", () => switchTab("preview"));
    
    // --- Core Functions ---
    async function handleGenerateReadme() {
        showMessage("info", "Memulai proses...");
        const userGeminiKey = localStorage.getItem("geminiApiKey");
        const userGithubKey = localStorage.getItem("githubApiToken");

        if (!userGithubKey || !userGeminiKey) {
            return showMessage("error", "GitHub Token dan Gemini API Key diperlukan. Silakan atur di Pengaturan Lanjutan.");
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
            switchTab("preview");
            showMessage("success", "README.md berhasil dibuat!");

        } catch (error) {
            showMessage("error", error.message);
            DOM.readmeOutput.innerText = `# Gagal Membuat README\n\n**Error:** ${error.message}`;
        } finally {
            setLoading(false);
        }
    }

    function handleTagInput(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const tagText = DOM.tagsInput.value.trim().toLowerCase();
            if (tagText && !tags.has(tagText)) {
                tags.add(tagText);
                // (Logika untuk menampilkan tag pill)
            }
            DOM.tagsInput.value = "";
        }
    }
    
    function handleTagRemove(e) { /* ... */ }
    function copyToClipboard() { /* ... */ }
    function parseGithubUrl(url) { /* ... */ }
    function stripMarkdownWrapper(text) { /* ... */ }
});