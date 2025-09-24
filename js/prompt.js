// js/prompt.js

/**
 * Creates the complete prompt for the Gemini API.
 * @param {object} repoDetails - Details of the GitHub repository.
 * @param {string[]} files - A list of file paths in the repository.
 * @param {string[]} imageUrls - URLs of images for the gallery.
 * @param {string[]} tags - User-provided context tags.
 * @param {string} [lang='en'] - The output language ('en' or 'id').
 * @param {string} [licenseType='none'] - The type of license.
 * @returns {string} The formatted prompt string.
 */
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
            ? `${sectionCounter + 2}. **Lisensi 📄**: Sebutkan bahwa proyek ini di bawah Lisensi ${licenseName} dan rujuk ke file LICENSE.`
            : `${sectionCounter + 2}. **License 📄**: Mention the project is under the ${licenseName} License and refer to the LICENSE file.`;
    }

    // Language-specific text templates with enhanced instructions
    const texts = {
        id: {
            intro: `Sebagai seorang Principal Software Engineer dan penulis teknis, buatkan file README.md yang sangat detail, profesional, dan komprehensif untuk repositori GitHub berikut. Gunakan emoji yang relevan untuk setiap bagian.`,
            badges: `2.  **Badges**: Sertakan badge dari Shields.io untuk bahasa utama, lisensi (jika ada), dan teknologi relevan lainnya yang bisa kamu deteksi.`,
            description: `3.  **Deskripsi Proyek 📝**: Tulis deskripsi yang menarik dan detail (3-4 paragraf). Jelaskan apa tujuan proyek ini, masalah apa yang dipecahkannya, dan untuk siapa proyek ini dibuat.`,
            features: `${sectionCounter}.  **Fitur Utama ✨**: Buat daftar fitur-fitur utama. Untuk setiap fitur, berikan deskripsi singkat namun berdampak yang menjelaskan apa yang dilakukannya dan manfaatnya.`,
            tech: `${sectionCounter + 1}.  **Tech Stack & Tools 🛠️**: Buat daftar teknologi, framework, dan tools yang digunakan. Jika memungkinkan, gunakan format tabel atau daftar yang rapi. Simpulkan dari daftar file (misalnya 'package.json', 'pom.xml', dll.) dan konteks yang diberikan.`,
            install: `${sectionCounter + 2}.  **Instalasi & Menjalankan Secara Lokal 🚀**: Berikan panduan langkah-demi-langkah yang jelas. Mulai dari prasyarat (misal: versi Node.js, Python, dll.), lalu kloning, instalasi dependensi, dan cara menjalankan proyek. Setiap perintah terminal HARUS berada di dalam blok kodenya sendiri (\`\`\`bash ... \`\`\`).`,
            contribute: `${sectionCounter + 3}. **Cara Berkontribusi 🤝**: Jelaskan secara singkat bagaimana orang lain dapat berkontribusi pada proyek ini.`,
            outro: `Pastikan hasil AKHIR HANYA berupa konten Markdown mentah yang lengkap dan terstruktur dengan baik, tanpa penjelasan pembuka atau penutup.`
        },
        en: {
            intro: `As a Principal Software Engineer and technical writer, create a highly detailed, professional, and comprehensive README.md file for the following GitHub repository. Use relevant emojis for each section.`,
            badges: `2.  **Badges**: Include badges from Shields.io for the main language, the license (if specified), and other relevant technologies you can detect.`,
            description: `3.  **Project Description 📝**: Write a compelling and detailed description (3-4 paragraphs). Explain what this project does, what problem it solves, and who it is for.`,
            features: `${sectionCounter}.  **Key Features ✨**: List the main features. For each feature, provide a brief but impactful description explaining what it does and its benefit.`,
            tech: `${sectionCounter + 1}.  **Tech Stack & Tools 🛠️**: List the technologies, frameworks, and tools used. If possible, use a table or a well-formatted list. Infer from the file list (e.g., 'package.json', 'pom.xml', etc.) and the provided context.`,
            install: `${sectionCounter + 2}.  **Installation & Running Locally 🚀**: Provide a clear, step-by-step guide. Start with prerequisites (e.g., Node.js version, Python, etc.), then cloning, installing dependencies, and how to run the project. Each terminal command MUST be in its own code block (\`\`\`bash ... \`\`\`).`,
            contribute: `${sectionCounter + 3}. **How to Contribute 🤝**: Briefly explain how others can contribute to this project.`,
            outro: `Ensure the FINAL output is ONLY the raw, complete, and well-structured Markdown content, without any introductory or concluding remarks.`
        }
    };
    
    const t = texts[lang];

    // Assemble the final prompt
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
        README Structure and Instructions (Follow VERY STRICTLY and be DETAILED):
        1.  **Project Title**: Use the project name as H1.
        ${t.badges}
        ${t.description}
        ${imageInstruction || ''}
        ${t.features}
        ${t.tech}
        ${t.install}
        ${t.contribute}
        ${licenseSection.replace((sectionCounter + 2).toString(), (sectionCounter + 4).toString())}
        ${t.outro}`;
}