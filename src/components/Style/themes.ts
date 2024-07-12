export function getThemeBackground(theme: string) {
  if (theme == 'theme-violet') {
    return 'bg-start-violet';
  } else if (theme == 'theme-orange') {
    return 'bg-start-orange';
  } else if (theme == 'theme-green') {
    return 'bg-start-green';
  } else if (theme == 'theme-olive') {
    return 'bg-start-olive';
  } else if (theme == 'theme-blue') {
    return 'bg-start-blue';
  } else if (theme == 'theme-heaven') {
    return 'bg-start-heaven';
  } else if (theme == 'theme-dark') {
    return 'bg-start-dark';
  } else if (theme == 'theme-purple') {
    return 'bg-start-purple';
  } else {
    return 'bg-start-violet';
  }
}

export const themes = [
  { name: 'theme-orange', preview: 'preview-theme-orange' },
  { name: 'theme-green', preview: 'preview-theme-green' },
  { name: 'theme-olive', preview: 'preview-theme-olive' },
  { name: 'theme-blue', preview: 'preview-theme-blue' },
  { name: 'theme-violet', preview: 'preview-theme-violet' },
  { name: 'theme-purple', preview: 'preview-theme-purple' },
  { name: 'theme-heaven', preview: 'preview-theme-heaven' },
  { name: 'theme-dark', preview: 'preview-theme-dark' },
];
