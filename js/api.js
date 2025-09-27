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
 * Calls the Gemini API with retry logic and explicit safety settings.
 * @param {string} prompt The prompt to send.
 * @param {string} apiKey The user's Gemini API key.
 * @returns {Promise<string>} The generated text.
 */
export async function callGeminiApi(prompt, apiKey) {
    if (!apiKey) throw new Error("Gemini API Key not found.");

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    
    // PERBAIKAN UTAMA: Menambahkan safetySettings untuk menghindari blokir yang tidak perlu.
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        safetySettings: [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            }
        ]
    };

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
                
                // Pengecekan respons yang lebih detail
                const candidate = data.candidates?.[0];
                if (candidate?.content?.parts?.[0]?.text) {
                    return candidate.content.parts[0].text;
                }
                
                // Jika tidak ada teks, cek kenapa generation di-stop
                if (candidate?.finishReason === 'SAFETY') {
                    throw new Error("Generation stopped due to safety settings, even after override. The prompt might contain sensitive content.");
                }

                console.error("Unexpected Gemini API response structure:", data);
                throw new Error("Failed to extract content from the AI response. Response might be empty.");
            }

            if (response.status === 503 || response.status === 500) {
                 lastError = new Error(`Gemini API Error: ${response.statusText} (attempt ${attempt})`);
                 console.warn(lastError.message);
                 await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
                 continue;
            }

            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error);
            if (attempt < maxRetries) {
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    }
    throw new Error(`Failed to call Gemini API after ${maxRetries} attempts. Last error: ${lastError.message}`);
}