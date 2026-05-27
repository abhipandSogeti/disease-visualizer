declare module '3dmol' {
  interface Viewer {
    clear(): void
    spin(axis: string, speed: number): void
    render(): void
    setStyle(sel: object, style: object): void
    addModel(data: string, fmt: string): void
    zoomTo(): void
  }
  export function createViewer(el: HTMLElement, opts: object): Viewer
}
