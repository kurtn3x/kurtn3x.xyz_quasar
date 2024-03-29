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
  'text/markdown',
];

const PDFMIME = ['application/pdf'];
const WYSIWYGMIME = ['text/wysiwyg'];

interface mimeMapType {
  icon: string;
  type: string;
  availableTypes: Array<string>;
}

const mimeMap: Map<string, mimeMapType> = new Map<string, mimeMapType>();

for (const mime of VIDEOMIME) {
  mimeMap.set(mime, {
    icon: 'movie',
    type: 'video',
    availableTypes: [],
  });
}
for (const mime of IMAGEMIME) {
  mimeMap.set(mime, {
    icon: 'image',
    type: 'image',
    availableTypes: [],
  });
}
for (const mime of TEXTMIME) {
  mimeMap.set(mime, {
    icon: 'text_fields',
    type: 'text',
    availableTypes: ['text', 'code'],
  });
}

for (const mime of CODEMIME) {
  mimeMap.set(mime, {
    icon: 'code',
    type: 'code',
    availableTypes: ['text', 'code'],
  });
}

for (const mime of PDFMIME) {
  mimeMap.set(mime, {
    icon: 'picture_as_pdf',
    type: 'pdf',
    availableTypes: [],
  });
}

for (const mime of WYSIWYGMIME) {
  mimeMap.set(mime, {
    icon: 'article',
    type: 'wysiwyg',
    availableTypes: ['code', 'text', 'wysiwyg'],
  });
}

export function getIcon(mime: string) {
  const t = mimeMap.get(mime);
  if (t == undefined) {
    return 'file_present';
  } else {
    return t.icon;
  }
}

export { mimeMap };
