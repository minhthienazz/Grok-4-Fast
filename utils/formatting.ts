export const formatDate = (value: number): string => {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatter.format(value);
};

export const formatDateTime = (value: number): string => {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(value);
};

export const formatWordCount = (words: number, characters: number): string => {
  if (words === 0) {
    return '0 từ';
  }
  return `${words} từ • ${characters} ký tự`;
};
