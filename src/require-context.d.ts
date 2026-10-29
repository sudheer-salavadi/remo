// rspack/webpack `require.context`, used by Root.tsx to discover apps.
declare const require: {
  context(directory: string, useSubdirectories: boolean, regExp: RegExp): {
    keys(): string[];
    (id: string): unknown;
  };
};
