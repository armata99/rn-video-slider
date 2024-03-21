// Require the 'fs' module to read the changelog file
const fs = require('fs');
// Require the 'markdown-it' module to parse Markdown files
const markdownIt = require('markdown-it')();

// Read the changelog file
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');

// Parse the changelog content as Markdown
const tokens = markdownIt.parse(changelog);

// Initialize an empty release body
let releaseBody = '';

// Iterate through the parsed tokens
for (const token of tokens) {
    // Check if the token represents a heading
    if (token.type === 'heading_open') {
        // Extract the heading level and content
        const level = token.tag.substr(1);
        const content = tokens[tokens.indexOf(token) + 1].content.trim();
        // Add the heading to the release body
        releaseBody += `${'#'.repeat(level)} ${content}\n\n`;
    }
    // Check if the token represents a list item
    else if (token.type === 'list_item_open') {
        // Extract the list item content
        const content = tokens[tokens.indexOf(token) + 1].content.trim();
        // Add the list item to the release body
        releaseBody += `- ${content}\n`;
    }
}

// Output the generated release body
console.log(releaseBody);
