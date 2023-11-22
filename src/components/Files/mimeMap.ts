const VIDEOMIME = [
  'video/ogg',
  'video/mp4',
  'video/x-matroska',
  'audio/mp4',
  'audio/mpeg',
  'audio/aac',
  'audio/x-caf',
  'audio/flac',
  'audio/ogg',
  'audio/wav',
  'application/x-mpegURL',
  'application/dash+xml',
];

const IMAGEMIME = [
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

const WYSIWYGMIME = ['text/wysiwyg'];

const TEXTMIME = ['text/plain', 'text/text'];

const CODEMIME = [
  'text/code',
  'application/x-javascript',
  'text/x-python',
  'application/javascript',
  'text/html',
  'text/css',
  'text/csv',
  'application/xml',
  'application/json',
  'application/yaml',
  'text/xml',
  'application/x-sh',
];

const MARKDOWNMIME = 'text/markdown';
const PDFMIME = 'application/pdf';

const mimeMap: Map<string, string> = new Map<string, string>();

for (const mime of VIDEOMIME) {
  mimeMap.set(mime, 'movie');
}
for (const mime of IMAGEMIME) {
  mimeMap.set(mime, 'image');
}
for (const mime of TEXTMIME) {
  mimeMap.set(mime, 'text_fields');
}

for (const mime of CODEMIME) {
  mimeMap.set(mime, 'code');
}

mimeMap.set(PDFMIME, 'picture_as_pdf');
mimeMap.set(MARKDOWNMIME, 'code');

export function getIcon(mime: string) {
  const t = mimeMap.get(mime);
  if (t == undefined) {
    return 'file_present';
  } else {
    return t;
  }
}

export {
  MARKDOWNMIME,
  VIDEOMIME,
  IMAGEMIME,
  PDFMIME,
  CODEMIME,
  WYSIWYGMIME,
  TEXTMIME,
};
