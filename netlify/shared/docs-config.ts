/**
 * Limits for the Documents screen, shared by the upload function and the page.
 * Files move in pieces because a single Netlify Function request or response is capped at about 6 MB.
 * 3 MiB pieces stay under that cap even after the platform base64-encodes binary bodies (3 MiB becomes about 4.2 MB).
 */
export const MAX_FILE_BYTES = 250 * 1000 * 1000
export const CHUNK_BYTES = 3 * 1024 * 1024
export const MAX_TITLE_LENGTH = 200
export const MAX_NOTE_LENGTH = 2000
export const MAX_NAME_LENGTH = 100
/** Deleted documents stay in the trash this long, then are removed for good. */
export const TRASH_DAYS = 30
/** Uploads that never finished are cleaned up after this long. */
export const ABANDONED_UPLOAD_HOURS = 24
