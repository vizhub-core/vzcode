import ColorHash from 'color-hash';
import { Presence } from '../types';

export const assignUserColor = (name: string): string => {
  const userColor = new ColorHash({ lightness: 0.75 }).rgb(name).join(',');
  return userColor;
};