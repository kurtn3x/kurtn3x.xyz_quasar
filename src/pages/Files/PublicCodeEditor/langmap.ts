import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

export const langmap = new Map();
langmap.set('javascript', javascript());
langmap.set('python', python());
langmap.set('cpp', cpp());
langmap.set('html', html());
langmap.set('json', json());
langmap.set('markdown', markdown());
