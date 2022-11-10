import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

export const langmap = new Map();
langmap.set('javascript', javascript());
langmap.set('python', python());
