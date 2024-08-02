import ColorHash from 'color-hash';
import { Presence } from '../types';

export const assignUserColor = (presence: Presence, id: string): Presence => {
  const userColor = new ColorHash({ lightness: 0.75 }).rgb(id).join(',');
  return { ...presence, userColor };
};