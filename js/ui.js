// js/ui.js

// --- DOM Element Exports ---
export const DOM = {
    // Buttons
    generateBtn: document.getElementById("generateBtn"),
    copyBtn: document.getElementById("copyBtn"),
    addImageBtn: document.getElementById("add-image-btn"),
    // Inputs
    githubUrlInput: document.getElementById("githubUrl"),
    tagsInput: document.getElementById("tags-input"),
    languageSelect: document.getElementById("language-select"),
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
    // Others
    loader: document.getElementById("loader"),
    btnText: document.getElementById("btn-text"),
};

// --- UI Functions ---
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
    setTimeout(() => div.remove(), 5000);
}

export function setLoading(isLoading) {
    DOM.generateBtn.disabled = isLoading;
    DOM.btnText.textContent = isLoading ? "Memproses..." : "Generate";
    DOM.loader.classList.toggle("hidden", !isLoading);
    if (isLoading) {
        DOM.readmeOutput.innerText = "Menganalisis repositori dan menghasilkan README.md, mohon tunggu...";
        renderPreview();
    }
}

export function switchTab(tabName) {
    // (Fungsi switchTab sama seperti sebelumnya)
}

export function renderPreview() {
    // (Fungsi renderPreview sama seperti sebelumnya)
}

export function addNewImageInput(isFirst = false) {
    // (Fungsi addNewImageInput sama seperti sebelumnya)
}