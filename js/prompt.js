// js/prompt.js

export function createPrompt(repoDetails, files, imageUrls, tags, lang = 'en', licenseType = 'none') {
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
    
    let sectionCounter = 4;
    if (imageUrls.length > 0) sectionCounter++;

    let licenseInstruction = "";
    let licenseSection = "";
    if (licenseType !== 'none') {
        const licenseName = licenseType.toUpperCase().replace('-', ' ');
        licenseInstruction = isIndonesian
            ? `\n**Instruksi Lisensi**: Proyek ini menggunakan Lisensi ${licenseName}. Buat bagian 'License' di akhir README yang menyatakan hal ini dan arahkan pembaca untuk melihat file 'LICENSE' untuk detail lengkap.`
            : `\n**License Instruction**: This project uses the ${licenseName} License. Create a 'License' section at the end of the README stating this, and direct readers to see the 'LICENSE' file for full details.`;
        
        licenseSection = isIndonesian 
            ? `${sectionCounter++}. **Lisensi 📄**: Sebutkan bahwa proyek ini di bawah Lisensi ${licenseName} dan rujuk ke file LICENSE.`
            : `${sectionCounter++}. **License 📄**: Mention the project is under the ${licenseName} License and refer to the LICENSE file.`;
    }


    const texts = {
        id: {
            intro: `Sebagai seorang ahli rekayasa perangkat lunak, buatkan file README.md yang profesional dan jelas untuk repositori GitHub berikut. Gunakan emoji yang relevan.`,
            badges: `2.  **Badges**: Sertakan badge dari Shields.io untuk bahasa utama DAN untuk teknologi yang relevan. Jika ada lisensi, tambahkan badge lisensi juga.`,
            description: `3.  **Deskripsi 📝**: Jelaskan proyek dalam 1-2 paragraf.`,
            features: `${sectionCounter++}.  **Fitur Utama ✨**: Buat daftar 3-5 fitur unggulan.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Sebutkan teknologi utama.`,
            // === INSTRUKSI PENTING DIKEMBALIKAN DI SINI ===
            install: `${sectionCounter++}.  **Instalasi & Menjalankan 🚀**: Berikan panduan langkah-demi-langkah. PENTING: Setiap perintah terminal (seperti 'git clone', 'npm install') HARUS berada di dalam blok kodenya sendiri menggunakan triple backticks (\`\`\`bash ... \`\`\`) agar mudah disalin.`,
            contribute: `${sectionCounter++}. **Cara Berkontribusi 🤝**: Jelaskan cara berkontribusi.`,
            outro: `Pastikan hasil AKHIR HANYA berupa konten Markdown mentah, tanpa penjelasan pembuka atau penutup.`
        },
        en: {
            intro: `As an expert software engineer, create a professional and clear README.md file for the following GitHub repository. Use relevant emojis.`,
            badges: `2.  **Badges**: Include badges from Shields.io for the main language AND for relevant technologies. If a license is specified, add a license badge too.`,
            description: `3.  **Description 📝**: Explain the project in 1-2 paragraphs.`,
            features: `${sectionCounter++}.  **Key Features ✨**: List 3-5 standout features.`,
            tech: `${sectionCounter++}.  **Tech Stack 🛠️**: Mention the main technologies.`,
            // === THE IMPORTANT INSTRUCTION IS RETURNED HERE ===
            install: `${sectionCounter++}.  **Installation & Running 🚀**: Provide a step-by-step guide. IMPORTANT: Each terminal command (like 'git clone', 'npm install') MUST be in its own code block using triple backticks (\`\`\`bash ... \`\`\`) for easy copying.`,
            contribute: `${sectionCounter++}. **How to Contribute 🤝**: Explain how to contribute.`,
            outro: `Ensure the FINAL output is ONLY the raw Markdown content, without any introductory or concluding remarks.`
        }
    };
    
    const t = texts[lang];

    return `${t.intro}
        ${licenseInstruction}
        Repository Data:
        - Name: ${repoDetails.name}
        - Description: ${repoDetails.description || "No description."}
        - Main Language: ${repoDetails.language}
        - Link: ${repoDetails.html_url}
        - License: ${licenseType}
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
        ${t.contribute}
        ${licenseSection}
        ${t.outro}`;
            }
