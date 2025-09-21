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
        // REVISI PESAN ERROR INI
        if (response.status === 404) throw new Error("Repository not found or its default branch is inaccessible.");
        if (response.status === 403) throw new Error("GitHub API rate limit exceeded. Please check your token or wait.");
        throw new Error(`GitHub API Error (status: ${response.status})`);
    }
    return response.json();
}

export async function callGeminiApi(prompt, apiKey) {
    if (!apiKey) throw new Error("Gemini API Key not found. Please add it in the settings.");
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Failed to extract content from the AI response.");
    }
}