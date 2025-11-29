/**
 * Strips HTML tags from a string and decodes common entities.
 * Preserves some structure by replacing block tags with newlines.
 * 
 * @param html The HTML string to strip
 * @returns Plain text string
 */
export const stripHtml = (html: string): string => {
    if (!html) return '';

    let text = html;

    // Pre-clean: remove newlines and extra spaces to handle HTML structure better
    text = text.replace(/[\r\n]+/g, ' ');

    // Replace block tags with newlines
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<\/h[1-6]>/gi, '\n\n');

    // Handle lists
    text = text.replace(/<\/li>/gi, '\n');
    text = text.replace(/<li[^>]*>/gi, '• ');
    text = text.replace(/<\/ul>/gi, '\n');
    text = text.replace(/<\/ol>/gi, '\n');

    // Strip all remaining tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode common entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Post-clean: Fix spacing issues
    // Remove whitespace after bullet points
    text = text.replace(/•\s+/g, '• ');
    // Collapse multiple newlines
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    text = text.replace(/\n\s*\n/g, '\n\n');

    return text.trim();
};
