import path from 'path';
// export const isDirectory = (file) => file.endsWith('/');
export const isDirectory = (file) => file.endsWith(path.sep);
