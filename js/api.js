// js/api.js

export async function fetchGithubApi(apiUrl) {
    const token = localStorage.getItem("githubApiToken");
    const headers = { "Accept": "application/vnd.github.v3+json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid GitHub token. Please check your token.");
        if (response.status === 404) throw new Error("Repository not found or its default branch is inaccessible.");
        if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Please check your token or wait.");
        throw new Error(`GitHub API Error (status: ${response.status})`);
    }
    return response.json();
}

/**
 * Calls the Gemini API with retry logic for transient errors.
 * @param {string} prompt The prompt to send to the model.
 * @param {string} apiKey The user's Gemini API key.
 * @returns {Promise<string>} The generated text from the model.
 */
export async function callGeminiApi(prompt, apiKey) {
    if (!apiKey) throw new Error("Gemini API Key not found. Please add it in the settings.");
    
    // PERBAIKAN 2: Menggunakan model gemini-1.5-flash-latest yang sangat stabil dan kuat.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    // PERBAIKAN 1: Menambahkan logika retry (coba lagi) jika terjadi error sementara
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    console.error("Unexpected Gemini API response structure:", data);
                     if (data.promptFeedback && data.promptFeedback.blockReason) {
                        throw new Error(`Generation blocked. Reason: ${data.promptFeedback.blockReason}`);
                    }
                    throw new Error("Failed to extract content from the AI response.");
                }
            }

            // Jika error bisa dicoba lagi (seperti 503 Service Unavailable)
            if (response.status === 503 || response.status === 500) {
                 lastError = new Error(`Gemini API Error: ${response.statusText} (attempt ${attempt})`);
                 console.warn(lastError.message);
                 // Tunggu sebelum mencoba lagi (1 detik, 2 detik, 4 detik)
                 await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt -1)));
                 continue; // Lanjut ke percobaan berikutnya
            }

            // Untuk error lain, langsung gagalkan
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error);
        }
    }

    // Jika semua percobaan gagal, lempar error terakhir
    throw new Error(`Failed to call Gemini API after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

