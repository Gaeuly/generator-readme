// js/prompt.js

export function createPrompt(repoDetails, files, imageUrls, tags, lang = 'en', configFileName = null, configFileContent = null) {
    const isIndonesian = lang === 'id';

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
            ? `\n**Konteks Tambahan dari Pengguna:**\n- Tags: ${tags.join(", ")}\n`
            : `\n**Additional Context from User:**\n- Tags: ${tags.join(", ")}\n`;
    }
    
    // --- PERUBAHAN UTAMA DIMULAI DI SINI ---
    // Buat blok instruksi dinamis berdasarkan file konfigurasi yang ditemukan
    let configInstruction = "";
    if (configFileName && configFileContent) {
        const fileTypeHint = configFileName.split('.').pop(); // Dapatkan ekstensi seperti 'json', 'xml', 'txt'
        configInstruction = isIndonesian
            ? `\n**File Konfigurasi Terdeteksi (${configFileName}):**\n*Gunakan konten file ini sebagai sumber utama untuk membuat bagian instalasi dan cara menjalankan proyek yang AKURAT.*\n\`\`\`${fileTypeHint}\n${configFileContent}\n\`\`\`\n`
            : `\n**Detected Configuration File (${configFileName}):**\n*Use the content of this file as the primary source for creating ACCURATE installation and running instructions.*\n\`\`\`${fileTypeHint}\n${configFileContent}\n\`\`\`\n`;
    }
    // --- PERUBAHAN UTAMA SELESAI ---

    let sectionCounter = 4;
    if (imageUrls.length > 0) sectionCounter++;

    const texts = {
        id: {
            intro: `Sebagai seorang ahli rekayasa perangkat lunak, buatkan file README.md yang profesional untuk repositori GitHub berikut. Gunakan emoji yang relevan.`,
            badges: `2.  **Badges**: Sertakan badge dari Shields.io untuk bahasa utama DAN teknologi yang relevan.`,
            description: `3.  **Deskripsi 📝**: Jelaskan proyek dalam 1-2 paragraf.`,
            features: `${sectionCounter++}.  **Fitur Utama ✨**: Buat daftar 3-5 fitur unggulan.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Sebutkan teknologi utama yang digunakan.`,
            install: `${sectionCounter++}.  **Instalasi & Menjalankan 🚀**: Berikan panduan langkah-demi-langkah yang JELAS dan AKURAT. **WAJIB**: Analisis file konfigurasi (${configFileName || 'tidak ada'}) yang diberikan untuk menentukan dependensi (misal: \`npm install\`, \`pip install -r requirements.txt\`, \`mvn install\`) dan cara menjalankan proyek (misal: \`npm run dev\`, \`python app.py\`). Setiap perintah terminal HARUS berada di dalam blok kodenya sendiri (\`\`\`bash ... \`\`\`).`,
            contribute: `${sectionCounter++}. **Cara Berkontribusi 🤝**: Jelaskan cara berkontribusi.`,
            outro: `Pastikan hasil AKHIR HANYA berupa konten Markdown mentah, tanpa penjelasan pembuka atau penutup.`
        },
        en: {
            intro: `As an expert software engineer, create a professional README.md file for the following GitHub repository. Use relevant emojis.`,
            badges: `2.  **Badges**: Include badges from Shields.io for the main language AND relevant technologies.`,
            description: `3.  **Description 📝**: Explain the project in 1-2 paragraphs.`,
            features: `${sectionCounter++}.  **Key Features ✨**: List 3-5 standout features.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Mention the main technologies used.`,
            install: `${sectionCounter++}.  **Installation & Running 🚀**: Provide a CLEAR and ACCURATE step-by-step guide. **MANDATORY**: Analyze the provided configuration file (${configFileName || 'none'}) to determine dependencies (e.g., \`npm install\`, \`pip install -r requirements.txt\`, \`mvn install\`) and run commands (e.g., \`npm run dev\`, \`python app.py\`). Each terminal command MUST be in its own code block (\`\`\`bash ... \`\`\`).`,
            contribute: `${sectionCounter++}. **How to Contribute 🤝**: Explain how to contribute.`,
            outro: `Ensure the FINAL output is ONLY the raw Markdown content, without any introductory or concluding remarks.`
        }
    };
    
    const t = texts[lang];

    return `${t.intro}
        Repository Data:
        - Name: ${repoDetails.name}
        - Description: ${repoDetails.description || "No description."}
        - Main Language: ${repoDetails.language}
        - Link: ${repoDetails.html_url}
        - Files: ${files.slice(0, 30).join(", ")}
        ${tagInstruction}
        ${configInstruction}
        README Structure and Instructions (Follow VERY STRICTLY):
        1.  **Project Title**: Use the project name as H1.
        ${t.badges}
        ${t.description}
        ${imageInstruction || ''}
        ${t.features}
        ${t.tech}
        ${t.install}
        ${t.contribute}
        ${t.outro}`;
}