import '@testing-library/jest-dom'

// jsdom lacks ResizeObserver, which several components (Globe, charts) use.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
