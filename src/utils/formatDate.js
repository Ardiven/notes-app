const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(input) {
  if (!input) return '';
  const date = input instanceof Date ? input : new Date(input);
  return dateFormatter.format(date);
}
