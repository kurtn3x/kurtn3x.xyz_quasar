import { Notify } from 'quasar';

// Export individual utility functions
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  Notify.create({
    type: 'positive',
    message: 'Copied to clipboard.',
  });
}
