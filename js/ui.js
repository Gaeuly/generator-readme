// js/ui.js

// Gathers all DOM elements for easy access.
export const DOM = {
    // Buttons
    generateBtn: document.getElementById("generateBtn"),
    copyBtn: document.getElementById("copyBtn"),
    addImageBtn: document.getElementById("add-image-btn"),
    addTagBtn: document.getElementById("add-tag-btn"),
    saveGithubTokenBtn: document.getElementById("save-github-token-btn"),
    saveGeminiTokenBtn: document.getElementById("save-gemini-token-btn"),
    // Inputs
    githubUrlInput: document.getElementById("githubUrl"),
    tagsInput: document.getElementById("tags-input"),
    languageSelect: document.getElementById("language-select"),
    githubTokenInput: document.getElementById("githubToken"),
    geminiTokenInput: document.getElementById("geminiToken"),
    // Containers
    messageContainer: document.getElementById("message-container"),
    imageInputsContainer: document.getElementById("image-inputs-container"),
    tagsContainer: document.getElementById("tags-container"),
    // Output Panes
    readmeOutput: document.getElementById("readmeOutput"),
    previewPane: document.getElementById("pane-preview"),
    markdownPane: document.getElementById("pane-markdown"),
    // Tabs
    markdownTab: document.getElementById("tab-markdown"),
    previewTab: document.getElementById("tab-preview"),
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
 * Displays a temporary notification message on the screen.
 * @param {'success'|'error'|'info'} type - The type of message.
 * @param {string} message - The content of the message to display.
 */
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

/**
 * Sets the loading state on the Generate button.
 * @param {boolean} isLoading - True if loading.
 */
export function setLoading(isLoading) {
    DOM.generateBtn.disabled = isLoading;
    DOM.btnText.textContent = isLoading ? "Generating..." : "Generate";
    DOM.loader.classList.toggle("hidden", !isLoading);
    if (isLoading) {
        DOM.readmeOutput.innerText = "Analyzing repository and generating README.md, please wait...";
        renderPreview();
    }
}

/**
 * Switches the view between the Markdown editor and the Preview pane.
 * @param {'markdown'|'preview'} tabName - The name of the tab to activate.
 */
export function switchTab(tabName) {
    const isMarkdown = tabName === "markdown";
    DOM.markdownPane.classList.toggle("hidden", !isMarkdown);
    DOM.previewPane.classList.toggle("hidden", isMarkdown);

    DOM.markdownTab.classList.toggle("bg-gray-800", isMarkdown);
    DOM.markdownTab.classList.toggle("text-white", isMarkdown);
    DOM.markdownTab.classList.toggle("text-gray-400", !isMarkdown);
    DOM.markdownTab.classList.toggle("hover:bg-gray-800/50", !isMarkdown);

    DOM.previewTab.classList.toggle("bg-gray-800", !isMarkdown);
    DOM.previewTab.classList.toggle("text-white", !isMarkdown);
    DOM.previewTab.classList.toggle("text-gray-400", isMarkdown);
    DOM.previewTab.classList.toggle("hover:bg-gray-800/50", isMarkdown);

    if (!isMarkdown) {
        renderPreview();
    }
}

/**
 * Renders the Markdown text from the editor into the preview pane.
 */
export function renderPreview() {
    let markdownText = DOM.readmeOutput.innerText.trim();
    DOM.previewPane.innerHTML = `<div class="markdown-body">${marked.parse(markdownText)}</div>`;
}

/**
 * Adds a new input field for an image URL.
 * @param {boolean} isFirst - True if this is the first input (no remove button).
 */
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

/**
 * Shows or hides the API keys modal.
 * @param {boolean} show - True to show, false to hide.
 */
export function toggleModal(show) {
    DOM.apiKeysModal.classList.toggle("hidden", !show);
}