import '@testing-library/jest-dom';

// Radix UI primitives (Select, Dialog) rely on browser APIs that jsdom does not implement.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

afterEach(() => {
  localStorage.clear();
});

// Radix warns for every dialog without a DialogDescription. That is a known a11y gap in the app
// (several dialogs have none); filter just this message so it doesn't drown real warnings.
const originalWarn = console.warn;
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Missing `Description`')) return;
    originalWarn(...args);
  });
});
