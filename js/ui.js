// js/ui.js

// Gathers all DOM elements for easy access.
export const DOM = {
    // Buttons
    generateBtn: document.getElementById("generateBtn"),
    copyBtn: document.getElementById("copyBtn"),
    copyLicenseBtn: document.getElementById("copyLicenseBtn"), // BARU
    addImageBtn: document.getElementById("add-image-btn"),
    addTagBtn: document.getElementById("add-tag-btn"),
    saveGithubTokenBtn: document.getElementById("save-github-token-btn"),
    saveGeminiTokenBtn: document.getElementById("save-gemini-token-btn"),
    // Inputs
    githubUrlInput: document.getElementById("githubUrl"),
    tagsInput: document.getElementById("tags-input"),
    languageSelect: document.getElementById("language-select"),
    licenseSelect: document.getElementById("license-select"), // BARU
    githubTokenInput: document.getElementById("githubToken"),
    geminiTokenInput: document.getElementById("geminiToken"),
    // Containers
    messageContainer: document.getElementById("message-container"),
    imageInputsContainer: document.getElementById("image-inputs-container"),
    tagsContainer: document.getElementById("tags-container"),
    // Output Panes
    readmeOutput: document.getElementById("readmeOutput"),
    licenseOutput: document.getElementById("licenseOutput"), // BARU
    previewPane: document.getElementById("pane-preview"),
    markdownPane: document.getElementById("pane-markdown"),
    licensePane: document.getElementById("pane-license"), // BARU
    // Tabs
    markdownTab: document.getElementById("tab-markdown"),
    previewTab: document.getElementById("tab-preview"),
    licenseTab: document.getElementById("tab-license"), // BARU
    // Modal Elements
    apiKeysModal: document.getElementById("api-keys-modal"),
    modalGithubTokenInput: document.getElementById("modal-github-token"),
    modalGeminiTokenInput: document.getElementById("modal-gemini-token"),
    modalSaveKeysBtn: document.getElementById("modal-save-keys-btn"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    // Others
    loader: document.getElementById("loader"),
    btnText: document.getElementById("btn-text"),
};

export function showMessage(type, message) {
    DOM.messageContainer.innerHTML = "";
    const colors = {
        error: "bg-red-900 border-red-700 text-red-300",
        success: "bg-green-900 border-green-700 text-green-300",
        info: "bg-blue-900 border-blue-700 text-blue-300",
    };
    const div = document.createElement("div");
    div.className = `p-4 rounded-lg border ${colors[type] || colors.info}`;
    div.textContent = message;
    DOM.messageContainer.appendChild(div);
    setTimeout(() => {
        if (div) {
          div.style.transition = "opacity 0.5s";
          div.style.opacity = "0";
          setTimeout(() => div.remove(), 500);
        }
    }, 4000);
}

export function setLoading(isLoading) {
    DOM.generateBtn.disabled = isLoading;
    DOM.btnText.textContent = isLoading ? "Generating..." : "Generate";
    DOM.loader.classList.toggle("hidden", !isLoading);
    if (isLoading) {
        DOM.readmeOutput.innerText = "Analyzing repository and generating README.md, please wait...";
        DOM.licenseOutput.innerText = "Generating LICENSE file if selected...";
        renderPreview();
    }
}

/**
 * Switches the view between the Markdown, Preview, and License panes.
 * @param {'markdown'|'preview'|'license'} activeTab - The name of the tab to activate.
 */
export function switchTab(activeTab) {
    // Sembunyikan semua pane
    DOM.markdownPane.classList.add("hidden");
    DOM.previewPane.classList.add("hidden");
    DOM.licensePane.classList.add("hidden");

    // Reset semua style tab
    const tabs = [DOM.markdownTab, DOM.previewTab, DOM.licenseTab];
    tabs.forEach(tab => {
        tab.classList.remove("bg-gray-800", "text-white");
        tab.classList.add("text-gray-400", "hover:bg-gray-800/50");
    });
    
    // Tampilkan pane dan style tab yang aktif
    if (activeTab === 'markdown') {
        DOM.markdownPane.classList.remove("hidden");
        DOM.markdownTab.classList.add("bg-gray-800", "text-white");
        DOM.markdownTab.classList.remove("text-gray-400", "hover:bg-gray-800/50");
    } else if (activeTab === 'preview') {
        DOM.previewPane.classList.remove("hidden");
        DOM.previewTab.classList.add("bg-gray-800", "text-white");
        DOM.previewTab.classList.remove("text-gray-400", "hover:bg-gray-800/50");
        renderPreview();
    } else if (activeTab === 'license') {
        DOM.licensePane.classList.remove("hidden");
        DOM.licenseTab.classList.add("bg-gray-800", "text-white");
        DOM.licenseTab.classList.remove("text-gray-400", "hover:bg-gray-800/50");
    }
}

export function renderPreview() {
    let markdownText = DOM.readmeOutput.innerText.trim();
    const options = { breaks: true };
    DOM.previewPane.innerHTML = `<div class="markdown-body">${marked.parse(markdownText, options)}</div>`;
}

export function addNewImageInput(isFirst = false) {
    const div = document.createElement("div");
    div.className = "flex items-center gap-3";
    div.innerHTML = `<input type="text" class="image-url-input w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500" placeholder="https://.../image.png"> ${
      !isFirst
        ? '<button class="remove-image-btn text-red-400 hover:text-red-300 font-bold text-xl">&times;</button>'
        : ""
    }`;
    DOM.imageInputsContainer.appendChild(div);
    if (!isFirst) {
        div.querySelector(".remove-image-btn").addEventListener("click", () => div.remove());
    }
}

export function toggleModal(show) {
    DOM.apiKeysModal.classList.toggle("hidden", !show);
}