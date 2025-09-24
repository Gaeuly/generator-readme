// js/ui.js

// Gathers all DOM elements for easy access.
export const DOM = {
    // Buttons
    generateBtn: document.getElementById("generateBtn"),
    copyBtn: document.getElementById("copyBtn"),
    copyLicenseBtn: document.getElementById("copyLicenseBtn"),
    addImageBtn: document.getElementById("add-image-btn"),
    addTagBtn: document.getElementById("add-tag-btn"),
    saveGithubTokenBtn: document.getElementById("save-github-token-btn"),
    saveGeminiTokenBtn: document.getElementById("save-gemini-token-btn"),
    // Inputs
    githubUrlInput: document.getElementById("githubUrl"),
    tagsInput: document.getElementById("tags-input"),
    languageSelect: document.getElementById("language-select"),
    licenseSelect: document.getElementById("license-select"),
    githubTokenInput: document.getElementById("githubToken"),
    geminiTokenInput: document.getElementById("geminiToken"),
    // Containers
    messageContainer: document.getElementById("message-container"),
    imageInputsContainer: document.getElementById("image-inputs-container"),
    tagsContainer: document.getElementById("tags-container"),
    // Output Panes
    readmeOutput: document.getElementById("readmeOutput"),
    licenseOutput: document.getElementById("licenseOutput"),
    previewPane: document.getElementById("pane-preview"),
    markdownPane: document.getElementById("pane-markdown"),
    licensePane: document.getElementById("pane-license"),
    // Tabs
    markdownTab: document.getElementById("tab-markdown"),
    previewTab: document.getElementById("tab-preview"),
    licenseTab: document.getElementById("tab-license"),
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

/**
 * Displays a message to the user.
 * @param {'error'|'success'|'info'} type - The type of message.
 * @param {string} message - The message content.
 */
export function showMessage(type, message) {
    DOM.messageContainer.innerHTML = "";
    const colors = {
        error: "bg-red-100 border-red-500 text-red-700",
        success: "bg-green-100 border-green-500 text-green-700",
        info: "bg-blue-100 border-blue-500 text-blue-700",
    };
    const div = document.createElement("div");
    div.className = `p-4 rounded-lg border-2 ${colors[type] || colors.info}`;
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

/**
 * Toggles the loading state of the generate button.
 * @param {boolean} isLoading - Whether the app is in a loading state.
 */
export function setLoading(isLoading) {
    DOM.generateBtn.disabled = isLoading;
    DOM.btnText.textContent = isLoading ? "Generating..." : "Generate";
    DOM.loader.classList.toggle("hidden", !isLoading);
    if (isLoading) {
        DOM.readmeOutput.innerText = "Analyzing repository and generating README.md, please wait...";
        DOM.licenseOutput.innerText = "Generating LICENSE file if selected...";
        renderPreview(); // Update preview to show loading message
    }
}

/**
 * Switches the view between the Markdown, Preview, and License panes.
 * @param {'markdown'|'preview'|'license'} activeTab - The name of the tab to activate.
 */
export function switchTab(activeTab) {
    // Hide all panes
    DOM.markdownPane.classList.add("hidden");
    DOM.previewPane.classList.add("hidden");
    DOM.licensePane.classList.add("hidden");

    // Reset all tab styles
    const tabs = [DOM.markdownTab, DOM.previewTab, DOM.licenseTab];
    tabs.forEach(tab => {
        tab.classList.remove("border-black", "text-black");
        tab.classList.add("text-gray-500", "border-transparent");
    });
    
    // Show the active pane and style the active tab
    if (activeTab === 'markdown') {
        DOM.markdownPane.classList.remove("hidden");
        DOM.markdownTab.classList.add("border-black", "text-black");
        DOM.markdownTab.classList.remove("text-gray-500");
    } else if (activeTab === 'preview') {
        DOM.previewPane.classList.remove("hidden");
        DOM.previewTab.classList.add("border-black", "text-black");
        DOM.previewTab.classList.remove("text-gray-500");
        renderPreview();
    } else if (activeTab === 'license') {
        DOM.licensePane.classList.remove("hidden");
        DOM.licenseTab.classList.add("border-black", "text-black");
        DOM.licenseTab.classList.remove("text-gray-500");
    }
}

/**
 * Renders the markdown content from the output area into the preview pane.
 */
export function renderPreview() {
    let markdownText = DOM.readmeOutput.innerText.trim();
    // Use marked.js to parse markdown to HTML
    const options = { breaks: true }; // a marked.js option to interpret line breaks as <br>
    DOM.previewPane.innerHTML = `<div class="markdown-body">${marked.parse(markdownText, options)}</div>`;
}

/**
 * Adds a new input field for an image URL.
 * @param {boolean} [isFirst=false] - Whether this is the initial input field.
 */
export function addNewImageInput(isFirst = false) {
    const div = document.createElement("div");
    div.className = "flex items-center gap-3";
    div.innerHTML = `<input type="text" class="image-url-input custom-input" placeholder="https://.../image.png"> ${
      !isFirst
        ? '<button class="remove-image-btn text-red-500 hover:text-red-700 font-bold text-2xl">&times;</button>'
        : ""
    }`;
    DOM.imageInputsContainer.appendChild(div);
    if (!isFirst) {
        div.querySelector(".remove-image-btn").addEventListener("click", () => div.remove());
    }
}

/**
 * Toggles the visibility of the API keys modal.
 * @param {boolean} show - Whether to show the modal.
 */
export function toggleModal(show) {
    DOM.apiKeysModal.classList.toggle("hidden", !show);
}