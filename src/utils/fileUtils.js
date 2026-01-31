/**
 * Sanitize filename to match backend sanitization
 * Replaces special characters with underscores to match server-side file storage
 */
export const sanitizeFilename = (filename) => {
    if (!filename) return '';

    // Get file extension
    const lastDot = filename.lastIndexOf('.');
    const name = lastDot > 0 ? filename.substring(0, lastDot) : filename;
    const ext = lastDot > 0 ? filename.substring(lastDot) : '';

    // Safe characters: letters, digits, underscore, hyphen, period
    const safeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.';

    // Replace unsafe characters with underscore
    const sanitized = name.split('').map(c => safeChars.includes(c) ? c : '_').join('');

    // Avoid starting with a dot
    const cleanName = sanitized.startsWith('.') ? '_' + sanitized.slice(1) : sanitized;

    return cleanName + ext;
};
