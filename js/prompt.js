// js/prompt.js

export function createPrompt(repoDetails, files, imageUrls, tags, lang = 'id') {
    const isIndonesian = lang === 'id';

    // Image gallery instruction
    let imageInstruction = "";
    if (imageUrls.length > 0) {
        // (Logika galeri gambar sama seperti sebelumnya)
        let imageMarkdown = `<p align="center"><img src="${imageUrls[0]}" alt="Project Preview" width="80%"></p>`;
        imageInstruction = isIndonesian 
            ? `4. **Galeri Proyek 🖼️**: Tampilkan galeri ini:\n${imageMarkdown}`
            : `4. **Project Gallery 🖼️**: Display this gallery:\n${imageMarkdown}`;
    }

    // Additional context from tags
    let tagInstruction = "";
    if (tags.length > 0) {
        tagInstruction = isIndonesian
            ? `\n**Konteks Tambahan dari Pengguna (Referensi Kuat!):**\n- Tags: ${tags.join(", ")}\n`
            : `\n**Additional Context from User (Strong Reference!):**\n- Tags: ${tags.join(", ")}\n`;
    }
    
    // Dynamic instruction numbering
    let sectionCounter = 4;
    if (imageUrls.length > 0) sectionCounter++;

    // Language-specific texts
    const texts = {
        id: {
            intro: `Sebagai seorang ahli rekayasa perangkat lunak dan penulis teknis, buatkan file README.md yang SANGAT BAGUS, profesional, dan jelas untuk repositori GitHub berikut. Gunakan GAYA BAHASA YANG EKSPRESIF DAN JELAS dengan banyak emoji yang relevan.`,
            title: `1.  **Judul Proyek**: Gunakan nama proyek sebagai H1.`,
            badges: `2.  **Badges**: Sertakan badge dari Shields.io untuk bahasa utama.`,
            description: `3.  **Deskripsi 📝**: Jelaskan proyek dalam 1-2 paragraf yang menarik.`,
            features: `${sectionCounter++}.  **Fitur Utama ✨**: Buat daftar 3-5 fitur unggulan.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Sebutkan teknologi utama.`,
            install: `${sectionCounter++}.  **Instalasi & Menjalankan 🚀**: Berikan panduan langkah-demi-langkah yang sangat jelas.`,
            contribute: `${sectionCounter++}. **Cara Berkontribusi 🤝**: Jelaskan cara berkontribusi.`,
            license: `${sectionCounter++}. **Lisensi 📄**: Sebutkan lisensi proyek.`,
            outro: `Pastikan hasil AKHIR HANYA berupa konten Markdown mentah, tanpa penjelasan atau blok kode pembungkus.`
        },
        en: {
            intro: `As an expert software engineer and technical writer, create an EXCELLENT, professional, and clear README.md file for the following GitHub repository. Use an EXPRESSIVE AND CLEAR TONE with plenty of relevant emojis.`,
            title: `1.  **Project Title**: Use the project name as H1.`,
            badges: `2.  **Badges**: Include badges from Shields.io for the main language.`,
            description: `3.  **Description 📝**: Explain the project in 1-2 engaging paragraphs.`,
            features: `${sectionCounter++}.  **Key Features ✨**: List 3-5 standout features.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Mention the main technologies.`,
            install: `${sectionCounter++}.  **Installation & Running 🚀**: Provide a very clear, step-by-step guide.`,
            contribute: `${sectionCounter++}. **How to Contribute 🤝**: Explain how to contribute.`,
            license: `${sectionCounter++}. **License 📄**: State the project's license.`,
            outro: `Ensure the FINAL output is ONLY the raw Markdown content, without any explanations or wrapper code blocks.`
        }
    };
    
    const t = texts[lang];

    return `${t.intro}
        Repository Data:
        - Name: ${repoDetails.name}
        - Description: ${repoDetails.description || "No description."}
        - Main Language: ${repoDetails.language}
        - Link: ${repoDetails.html_url}
        - Files: ${files.slice(0, 20).join(", ")}
        ${tagInstruction}
        README Structure and Instructions (Follow VERY STRICTLY):
        ${t.title}
        ${t.badges}
        ${t.description}
        ${imageInstruction}
        ${t.features}
        ${t.tech}
        ${t.install}
            - 1. Clone the repository: \`git clone ${repoDetails.html_url}\`
            - 2. Navigate to the directory: \`cd ${repoDetails.name}\`
            - 3. Install dependencies: (Suggest the correct command based on files, e.g., \`npm install\` for 'package.json').
            - 4. Run the project: (Suggest the most common command, e.g., \`npm start\`).
        ${t.contribute}
        ${t.license} (\`${repoDetails.license ? repoDetails.license.name : "Not specified"}\`).
        ${t.outro}`;
}