// js/prompt.js

export function createPrompt(repoDetails, files, imageUrls, tags, lang = 'id') {
    const isIndonesian = lang === 'id';

    // (Logika galeri gambar tidak berubah)
    let imageInstruction = "";
    if (imageUrls.length > 0) {
        let imageMarkdown = `<p align="center"><img src="${imageUrls[0]}" alt="Project Preview" width="80%"></p>`;
        imageInstruction = isIndonesian 
            ? `4. **Galeri Proyek 🖼️**: Tampilkan galeri ini:\n${imageMarkdown}`
            : `4. **Project Gallery 🖼️**: Display this gallery:\n${imageMarkdown}`;
    }

    let tagInstruction = "";
    if (tags.length > 0) {
        tagInstruction = isIndonesian
            ? `\n**Konteks Tambahan dari Pengguna (Referensi Kuat!):**\n- Tags: ${tags.join(", ")}\n`
            : `\n**Additional Context from User (Strong Reference!):**\n- Tags: ${tags.join(", ")}\n`;
    }
    
    let sectionCounter = 4;
    if (imageUrls.length > 0) sectionCounter++;

    // Teks multi-bahasa dengan perintah yang sudah diperbaiki
    const texts = {
        id: {
            intro: `Sebagai seorang ahli rekayasa perangkat lunak, buatkan file README.md yang SANGAT BAGUS, profesional, dan jelas untuk repositori GitHub berikut. Gunakan emoji yang relevan untuk setiap bagian.`,
            // PERBAIKAN 1: Minta badge untuk tags juga
            badges: `2.  **Badges**: Sertakan badge dari Shields.io untuk bahasa utama DAN untuk teknologi relevan yang disebutkan di Tags (misal: React, Vue, HTML, CSS). Posisikan di tengah.`,
            description: `3.  **Deskripsi 📝**: Jelaskan proyek dalam 1-2 paragraf yang menarik.`,
            features: `${sectionCounter++}.  **Fitur Utama ✨**: Buat daftar 3-5 fitur unggulan.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Sebutkan teknologi utama.`,
            // PERBAIKAN 2: Perintahkan penggunaan backticks `...`
            install: `${sectionCounter++}.  **Instalasi & Menjalankan 🚀**: Berikan panduan langkah-demi-langkah. PENTING: Selalu bungkus semua perintah shell (seperti 'git clone', 'cd', 'npm install') dan nama file dengan backticks tunggal (\`...\`) agar ditampilkan sebagai kode.`,
            contribute: `${sectionCounter++}. **Cara Berkontribusi 🤝**: Jelaskan cara berkontribusi.`,
            license: `${sectionCounter++}. **Lisensi 📄**: Sebutkan lisensi proyek.`,
            outro: `Pastikan hasil AKHIR HANYA berupa konten Markdown mentah, tanpa penjelasan atau blok kode pembungkus.`
        },
        en: {
            intro: `As an expert software engineer, create an EXCELLENT, professional, and clear README.md file for the following GitHub repository. Use relevant emojis for each section.`,
            // FIX 1: Ask for badges from tags too
            badges: `2.  **Badges**: Include badges from Shields.io for the main language AND for relevant technologies mentioned in the Tags (e.g., React, Vue, HTML, CSS). Center-align them.`,
            description: `3.  **Description 📝**: Explain the project in 1-2 engaging paragraphs.`,
            features: `${sectionCounter++}.  **Key Features ✨**: List 3-5 standout features.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Mention the main technologies.`,
            // FIX 2: Enforce the use of backticks `...`
            install: `${sectionCounter++}.  **Installation & Running 🚀**: Provide a step-by-step guide. IMPORTANT: Always wrap all shell commands (like 'git clone', 'cd', 'npm install') and filenames in single backticks (\`...\`) to render them as code.`,
            contribute: `${sectionCounter++}. **How to Contribute 🤝**: Explain how to contribute.`,
            license: `${sectionCounter++}. **License 📄**: State the project's license.`,
            outro: `Ensure the FINAL output is ONLY the raw Markdown content, without any explanations or wrapper code blocks.`
        }
    };
    
    const t = texts[lang];

    // Prompt lengkap yang dikirim ke AI
    return `${t.intro}
        Repository Data:
        - Name: ${repoDetails.name}
        - Description: ${repoDetails.description || "No description."}
        - Main Language: ${repoDetails.language}
        - Link: ${repoDetails.html_url}
        - Files: ${files.slice(0, 30).join(", ")}
        ${tagInstruction}
        README Structure and Instructions (Follow VERY STRICTLY):
        1.  **Project Title**: Use the project name as H1.
        ${t.badges}
        ${t.description}
        ${imageInstruction || ''}
        ${t.features}
        ${t.tech}
        ${t.install}
            - 1. Clone the repository: \`git clone ${repoDetails.html_url}\`
            - 2. Navigate to the directory: \`cd ${repoDetails.name}\`
            - 3. Install dependencies: (Suggest the correct command based on files).
            - 4. Run the project: (Suggest the most common command).
        ${t.contribute}
        ${t.license} (\`${repoDetails.license ? repoDetails.license.name : "Not specified"}\`).
        ${t.outro}`;
}
