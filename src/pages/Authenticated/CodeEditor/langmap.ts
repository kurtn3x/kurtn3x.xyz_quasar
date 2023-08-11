import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

export const langmap = new Map();
langmap.set('python', python());
langmap.set('json', json());
langmap.set('markdown', markdown());
