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

    async function handleGenerate() {
        const userGeminiKey = localStorage.getItem("geminiApiKey");
        const userGithubKey = localStorage.getItem("githubApiToken");

        if (!userGithubKey) {
            showMessage("error", "GitHub Token is required. Please add it in the settings.");
            toggleModal(true);
            return;
        }

        // PERUBAHAN: Logika untuk membatasi penggunaan jika tidak ada Gemini API Key
        if (!userGeminiKey) {
            const lastGenTimestamp = localStorage.getItem("lastGenerationTimestamp");
            if (lastGenTimestamp) {
                const timeDiff = new Date().getTime() - Number(lastGenTimestamp);
                const hoursPassed = timeDiff / (1000 * 60 * 60);
                if (hoursPassed < 24) {
                    showMessage(
                        "error",
                        `You have reached the 1 generation/day limit. Time remaining: ${(24 - hoursPassed).toFixed(1)} hours. Add your own Gemini API Key for unlimited access.`
                    );
                    return;
                }
            }
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
            
            const selectedLicense = DOM.licenseSelect.value;
            
            if (selectedLicense !== 'none') {
                try {
                    const licenseData = await fetchGithubApi(`https://api.github.com/licenses/${selectedLicense}`);
                    const year = new Date().getFullYear();
                    const author = repoDetails.owner.login || "[author name]";
                    const licenseText = licenseData.body
                        .replace(/\[year\]/g, year)
                        .replace(/\[fullname\]/g, author);
                    DOM.licenseOutput.textContent = licenseText;
                } catch (licenseError) {
                    DOM.licenseOutput.textContent = `Failed to fetch license: ${licenseError.message}`;
                    showMessage("error", `Failed to fetch ${selectedLicense} license details.`);
                }
            } else {
                 DOM.licenseOutput.textContent = "No license selected.";
            }

            const imageUrls = Array.from(document.querySelectorAll(".image-url-input"))
                .map(input => input.value.trim()).filter(Boolean);
            
            const selectedLang = DOM.languageSelect.value;
            const prompt = createPrompt(repoDetails, filePaths, imageUrls, Array.from(tags), selectedLang, selectedLicense);
            
            // Note: We need a placeholder key if user doesn't provide one, assuming a backend proxy would handle it.
            // For a pure client-side app, the key check above is sufficient. Here we assume a valid key is always needed.
            const apiKeyToUse = userGeminiKey || "YOUR_FALLBACK_OR_PROXY_KEY"; // This line is more conceptual for a backend setup. For pure client-side, the check above handles it.
             if (!userGeminiKey) {
                showMessage("error", "A Gemini API key is required to generate content. Please add one in the settings.");
                setLoading(false);
                return;
            }

            const generatedReadme = await callGeminiApi(prompt, userGeminiKey);
            
            DOM.readmeOutput.textContent = stripMarkdownWrapper(generatedReadme);
            
            // PERUBAHAN: Simpan timestamp setelah berhasil generate (jika tanpa key)
            if (!userGeminiKey) {
                localStorage.setItem("lastGenerationTimestamp", new Date().getTime().toString());
            }

            switchTab("preview");
            showMessage("success", "README.md and LICENSE generated successfully!");

        } catch (error) {
            showMessage("error", error.message);
            DOM.readmeOutput.textContent = `# Failed to Generate README\n\n**Error:** ${error.message}`;
        } finally {
            setLoading(false);
        }
    }

    // ... sisa fungsi lainnya (saveToken, addTag, dll) tidak perlu diubah ...
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

    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        try {
            navigator.clipboard.writeText(element.textContent).then(() => {
                showMessage("success", "Copied to clipboard!");
            });
        } catch (err) {
            showMessage("error", "Failed to copy text.");
        }
    }

    // --- Event Listeners ---
    DOM.generateBtn.addEventListener("click", handleGenerate);
    DOM.checkModelsBtn.addEventListener("click", checkAvailableModels);
    DOM.copyBtn.addEventListener("click", () => copyToClipboard("readmeOutput"));
    DOM.copyLicenseBtn.addEventListener("click", () => copyToClipboard("licenseOutput"));
    
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
    DOM.licenseTab.addEventListener("click", () => switchTab("license"));
    
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
    
    // Placeholder function, assuming it exists
    async function checkAvailableModels() {
        console.log("Checking for available models...");
    }
});