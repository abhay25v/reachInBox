declare module 'csv-parser' {
  import { Transform } from 'stream';
  
  interface Options {
    separator?: string;
    quote?: string;
    escape?: string;
    newline?: string;
    mapHeaders?: (args: { header: string; index: number }) => string | null;
    mapValues?: (args: { header: string; index: number; value: any }) => any;
    strict?: boolean;
    skipLines?: number;
    maxRowBytes?: number;
    skipComments?: boolean | string;
  }

  function csv(options?: Options): Transform;
  export = csv;
}
