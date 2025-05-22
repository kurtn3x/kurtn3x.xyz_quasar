import { Notify } from 'quasar';

// Export individual utility functions
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  Notify.create({
    type: 'positive',
    message: 'Copied to clipboard.',
  });
}

export function fileSizeIEC(bytes: number) {
  if (Math.abs(bytes) < 1024) {
    return bytes + ' B';
  }

  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** 2;

  do {
    bytes /= 1024;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= 1024 && u < units.length - 1);

  return bytes.toFixed(2) + ' ' + units[u];
}

export function transferedPercentLabel(num: number) {
  if (num > 0.99) {
    return '100%';
  } else {
    return Math.round(num * 100) + '%';
  }
}
