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
        // ... (fungsi ini tidak berubah)
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
            
            const selectedLicense = DOM.licenseSelect.value;
            
            if (selectedLicense !== 'none') {
                try {
                    const licenseData = await fetchGithubApi(`https://api.github.com/licenses/${selectedLicense}`);
                    const year = new Date().getFullYear();
                    const author = repoDetails.owner.login || "[nama author]";
                    const licenseText = licenseData.body
                        .replace(/\[year\]/g, year)
                        .replace(/\[fullname\]/g, author);
                    DOM.licenseOutput.innerText = licenseText;
                } catch (licenseError) {
                    DOM.licenseOutput.innerText = `Failed to fetch license: ${licenseError.message}`;
                    showMessage("error", `Failed to fetch ${selectedLicense} license details.`);
                }
            } else {
                 DOM.licenseOutput.innerText = "No license selected.";
            }

            const imageUrls = Array.from(document.querySelectorAll(".image-url-input"))
                .map(input => input.value.trim()).filter(Boolean);
            
            const selectedLang = DOM.languageSelect.value;
            const prompt = createPrompt(repoDetails, filePaths, imageUrls, Array.from(tags), selectedLang, selectedLicense);
            const generatedReadme = await callGeminiApi(prompt, userGeminiKey);
            
            DOM.readmeOutput.innerText = stripMarkdownWrapper(generatedReadme);
            
            switchTab("preview");
            showMessage("success", "README.md and LICENSE generated successfully!");

        } catch (error) {
            showMessage("error", error.message);
            DOM.readmeOutput.innerText = `# Failed to Generate README\n\n**Error:** ${error.message}`;
        } finally {
            setLoading(false);
        }
    }

    // --- FUNGSI BARU UNTUK CEK MODEL ---
    async function checkAvailableModels() {
        const apiKey = localStorage.getItem("geminiApiKey");
        if (!apiKey) {
            return showMessage("error", "Please save your Gemini API Key first.");
        }

        showMessage("info", "Checking available models...");
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }
            const data = await response.json();
            
            const generativeModels = data.models
                .filter(model => model.supportedGenerationMethods.includes("generateContent"))
                .map(model => `<li><code>${model.name.replace("models/", "")}</code></li>`)
                .join("");

            if (generativeModels) {
                const messageHtml = `<strong>Available Generative Models:</strong><ul class="list-disc pl-5 mt-2">${generativeModels}</ul>`;
                showMessage("info", messageHtml, true);
            } else {
                showMessage("error", "No generative models found for your API key.");
            }

        } catch (error) {
            showMessage("error", `Failed to fetch models: ${error.message}`);
        }
    }

    // ... (fungsi lainnya tidak berubah)
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
            navigator.clipboard.writeText(element.innerText).then(() => {
                showMessage("success", "Copied to clipboard!");
            });
        } catch (err) {
            showMessage("error", "Failed to copy text.");
        }
    }

    // --- Event Listeners ---
    DOM.generateBtn.addEventListener("click", handleGenerate);
    DOM.checkModelsBtn.addEventListener("click", checkAvailableModels); // TAMBAHKAN INI
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
});