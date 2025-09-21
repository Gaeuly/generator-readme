## Introduction

This project is a web application designed to generate README.md files for your GitHub repositories. It simplifies the process of creating comprehensive and professional documentation by providing a user-friendly interface to input project details and generate a well-formatted README. The application supports features such as adding images, tags, and utilizes external APIs for enhanced functionality.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Gaeuly/generator-readme.git
    cd generator-readme
    ```

2.  **Open `index.html` in your web browser.**  No further installation steps are required as this is a client-side application.

## Usage

1.  **Enter your GitHub repository URL:**  Input the URL of the GitHub repository you want to document.
2.  **Add Images:**  Upload or provide URLs for images to be included in your README.
3.  **Add Tags:**  Enter relevant tags to categorize your project.
4.  **Generate README:** Click the "Generate" button to create the README content.
5.  **Copy and Paste:**  Copy the generated Markdown content and paste it into your `README.md` file in your repository.

**Example:**

1.  Open `index.html` in your browser.
2.  Enter a GitHub repository URL (e.g., `https://github.com/your-username/your-repo`).
3.  Add an image URL or upload an image.
4.  Add tags like "JavaScript", "Web App", or "Documentation".
5.  Click "Generate".
6.  Copy the generated Markdown.
7.  Create a `README.md` file in your repository and paste the content.

## Features

*   **GitHub Repository URL Input:** Allows users to specify the GitHub repository.
*   **Image Upload/URL Input:** Enables the inclusion of images in the README.
*   **Tagging System:** Supports adding tags for project categorization.
*   **README Generation:** Generates Markdown content for a comprehensive README.
*   **GitHub API Integration:**  (Implied by `api.js`) Potentially fetches repository details.
*   **Gemini API Integration:** (Implied by `api.js`) Potentially uses Gemini for enhanced content generation.
*   **User-Friendly Interface:** Provides an intuitive interface for easy use.
*   **Local Storage:**  Saves GitHub and Gemini API tokens for persistent use.

## Contributing

This project is open-source.  You can contribute by:

*   **Reporting bugs:**  Report any issues you find.
*   **Suggesting enhancements:**  Propose new features or improvements.
*   **Submitting pull requests:**  Contribute code changes.

To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Submit a pull request.

## Deployment

Since this is a client-side application, deployment involves hosting the `index.html` file and associated assets (CSS, JavaScript, images).

1.  **Choose a hosting provider:**  Consider options like Netlify (as mentioned in the description), GitHub Pages, or other static site hosting services.
2.  **Deploy the project:**  Follow the instructions provided by your chosen hosting provider to deploy the `index.html` file and the `css`, `js`, and `logo-web.png` files.
3.  **Access the application:**  Once deployed, you can access the application via the URL provided by your hosting provider.

## Testing

This project relies on client-side JavaScript.  Testing can be performed manually by:

1.  **Opening `index.html` in a web browser.**
2.  **Manually testing all features:** Verify that all input fields work correctly, images are displayed, tags are added, and the README generation functions as expected.
3.  **Checking console for errors:**  Inspect the browser's developer console for any JavaScript errors.

## Examples

**Example 1: Generating a README for a Simple Project**

1.  Open the application in your browser.
2.  Enter a GitHub repository URL.
3.  Add a project preview image.
4.  Add tags like "JavaScript" and "Web App".
5.  Click "Generate".
6.  Copy the generated Markdown.
7.  Create a `README.md` file in your repository and paste the content.

**Example 2: Using GitHub and Gemini API Tokens**

1.  In the application, enter your GitHub API token in the designated input field and click "Save".
2.  Enter your Gemini API key in the designated input field and click "Save".
3.  Enter a GitHub repository URL.
4.  Add images and tags.
5.  Click "Generate". The generated README may leverage the API integrations.

## Project Structure

```
generator-readme/
├── css/
│   └── (CSS files)
├── js/
│   ├── api.js        # Handles API calls (GitHub, Gemini)
│   ├── main.js       # Main application logic
│   ├── prompt.js     # Generates prompts for API calls
│   └── ui.js         # Manages the user interface
├── index.html        # Main HTML file
├── logo-web.png      # Project logo
└── README.md         # This file
```

## Configuration

The application stores GitHub and Gemini API tokens in local storage.  To configure the application:

1.  **GitHub API Token:**  Obtain a GitHub personal access token (PAT) with the necessary permissions (e.g., `public_repo` if accessing public repositories).  Enter the token in the designated input field and click "Save".
2.  **Gemini API Key:**  Obtain a Gemini API key. Enter the key in the designated input field and click "Save".
3.  **Other settings:**  No other configuration is required.  The application is designed to be used directly through the web interface.