// js/main.js
import { fetchGithubApi, callGeminiApi } from './api.js';
import { createPrompt } from './prompt.js';
import { DOM, showMessage, setLoading, switchTab, renderPreview, addNewImageInput, toggleModal } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    let tags = new Set();
    
    function initializeApp() {
        DOM.githubTokenInput.value = localStorage.getItem("githubApiToken") || "";
        DOM.geminiTokenInput.value = localStorage.getItem("geminiApiKey") || "";
        addNewImageInput(true);

        if (!localStorage.getItem("githubApiToken") || !localStorage.getItem("geminiApiKey")) {
            toggleModal(true);
        }
    }

    async function handleGenerateReadme() {
        const userGeminiKey = localStorage.getItem("geminiApiKey");
        const userGithubKey = localStorage.getItem("githubApiToken");

        if (!userGithubKey || !userGeminiKey) {
            showMessage("error", "GitHub Token and Gemini API Key are required.");
            toggleModal(true);
            return;
        }

        const url = DOM.githubUrlInput.value.trim();
        if (!url) return showMessage("error", "GitHub URL cannot be empty.");
        
        const repoPath = parseGithubUrl(url);
        if (!repoPath) return showMessage("error", "Invalid GitHub URL format.");

        setLoading(true);
        switchTab("markdown");

        try {
            const repoDetails = await fetchGithubApi(`https://api.github.com/repos/${repoPath}`);
            const defaultBranch = repoDetails.default_branch;
            if (!defaultBranch) throw new Error("Could not determine the default branch.");

            const repoTree = await fetchGithubApi(`https://api.github.com/repos/${repoPath}/git/trees/${defaultBranch}?recursive=1`);
            const filePaths = repoTree.tree.map(f => f.path);
            
            // --- PERUBAHAN UTAMA DIMULAI DI SINI ---
            // Daftar prioritas file konfigurasi untuk dideteksi
            const configFilePriority = [
                'package.json',      // Node.js
                'composer.json',     // PHP (Composer)
                'requirements.txt',  // Python (Pip)
                'pom.xml',           // Java (Maven)
                'build.gradle',      // Java/Android (Gradle)
                'Dockerfile'         // Docker
            ];

            let configFileContent = null;
            let configFileName = null;

            // Cari file konfigurasi berdasarkan prioritas
            for (const fileName of configFilePriority) {
                const foundFile = repoTree.tree.find(file => file.path.endsWith(fileName));
                if (foundFile) {
                    try {
                        const contentData = await fetchGithubApi(`https://api.github.com/repos/${repoPath}/contents/${foundFile.path}?ref=${defaultBranch}`);
                        if (contentData.content) {
                            configFileName = fileName;
                            configFileContent = atob(contentData.content);
                            break; // Hentikan pencarian setelah file pertama ditemukan
                        }
                    } catch (e) {
                        console.warn(`Could not fetch ${fileName} content:`, e.message);
                    }
                }
            }
            // --- PERUBAHAN UTAMA SELESAI ---

            const imageUrls = Array.from(document.querySelectorAll(".image-url-input"))
                .map(input => input.value.trim()).filter(Boolean);
            
            const selectedLang = DOM.languageSelect.value;
            // Kirim nama dan konten file konfigurasi yang ditemukan ke prompt
            const prompt = createPrompt(repoDetails, filePaths, imageUrls, Array.from(tags), selectedLang, configFileName, configFileContent);
            const generatedReadme = await callGeminiApi(prompt, userGeminiKey);
            
            DOM.readmeOutput.innerText = stripMarkdownWrapper(generatedReadme);
            switchTab("preview");
            showMessage("success", "README.md generated successfully! Check the 'Preview' tab.");

        } catch (error) {
            showMessage("error", error.message);
            DOM.readmeOutput.innerText = `# Failed to Generate README\n\n**Error:** ${error.message}`;
        } finally {
            setLoading(false);
        }
    }

    function saveToken(key, value, name) {
        if (value && value.trim()) {
            localStorage.setItem(key, value);
            showMessage("success", `${name} API Token saved successfully.`);
        } else {
            localStorage.removeItem(key);
            showMessage("info", `${name} API Token removed.`);
        }
    }
    
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

    function stripMarkdownWrapper(text) {
        return text.replace(/^```markdown\s*/, "").replace(/```$/, "").trim();
    }

    function parseGithubUrl(url) {
        const match = url.match(/github\.com\/([^\/]+\/[^\/]+)(\/|$)/);
        return match ? match[1].replace(".git", "") : null;
    }

    function copyToClipboard() {
        const rawText = DOM.readmeOutput.innerText;
        try {
            navigator.clipboard.writeText(rawText).then(() => {
                showMessage("success", "Copied to clipboard!");
            });
        } catch (err) {
            showMessage("error", "Failed to copy text.");
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
            showMessage("error", "Both API keys are required to continue.");
        }
    });
    DOM.modalCloseBtn.addEventListener("click", () => toggleModal(false));
    
    initializeApp();
});