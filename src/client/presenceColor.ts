import ColorHash from 'color-hash';

export const assignUserColor = (name: string): string => {
  const userColor = new ColorHash({ lightness: 0.75 })
    .rgb(name)
    .join(',');
  return userColor;
};
