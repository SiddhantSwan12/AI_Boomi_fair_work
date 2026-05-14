export { };

declare module '*.glb';
declare module '*.png';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
