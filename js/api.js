// js/api.js

export async function fetchGithubApi(apiUrl) {
    const token = localStorage.getItem("githubApiToken");
    const headers = { "Accept": "application/vnd.github.v3+json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
        if (response.status === 401) throw new Error("Token GitHub tidak valid.");
        if (response.status === 404) throw new Error("Repositori tidak ditemukan atau branch 'main' tidak ada.");
        if (response.status === 403) throw new Error("Batas API GitHub terlampaui.");
        throw new Error(`Error dari GitHub API (status: ${response.status})`);
    }
    return response.json();
}

export async function callGeminiApi(prompt, apiKey) {
    if (!apiKey) throw new Error("Gemini API Key tidak ditemukan.");
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error dari Gemini API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Gagal mengekstrak konten dari respons AI.");
    }
}