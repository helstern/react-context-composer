import * as container from './container';

export { default as khan, GrapNode } from './khan';
export { container };

export type ReturnTypes<T extends { [key: string]: (...args: any[]) => any }> = {
  [key in keyof T]: ReturnType<T[key]>
};
