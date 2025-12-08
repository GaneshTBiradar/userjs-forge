import type { ObserverOptions, WaitOptions } from "./types";

/**
 * Wait for an element to appear in the DOM
 */
async function waitForElement(selector: string, options: WaitOptions = {}): Promise<HTMLElement> {
  const { timeout = 30000, interval = 500, throwOnTimeout = true } = options;

  const startTime = Date.now();

  while (!document.querySelector(selector)) {
    if (Date.now() - startTime > timeout) {
      if (throwOnTimeout) {
        throw new Error(`Timeout waiting for element: ${selector}`);
      }
      return null as unknown as HTMLElement;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return document.querySelector(selector) as HTMLElement;
}

/**
 * Wait for multiple elements to appear
 */
async function waitForElements(
  selectors: string[],
  options: WaitOptions = {},
): Promise<HTMLElement[]> {
  return Promise.all(selectors.map((selector) => waitForElement(selector, options)));
}

/**
 * Wait for an element to be removed from the DOM
 */
async function waitForElementRemoval(selector: string, options: WaitOptions = {}): Promise<void> {
  const { timeout = 30000, interval = 500 } = options;
  const startTime = Date.now();

  while (document.querySelector(selector)) {
    if (Date.now() - startTime > timeout) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Wait for element using MutationObserver (more efficient)
 */
function waitForElementObserver(
  selector: string,
  options: WaitOptions & ObserverOptions = {},
): Promise<HTMLElement> {
  const {
    timeout = 30000,
    subtree = true,
    childList = true,
    attributes = false,
    characterData = false,
  } = options;

  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element as HTMLElement);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element as HTMLElement);
      }
    });

    observer.observe(document.body, {
      subtree,
      childList,
      attributes,
      characterData,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

/**
 * Simulate user input on an element
 */
function simulateInput(element: HTMLElement, value: string): void {
  element.textContent = value;
  const event = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    data: value,
    inputType: "insertText",
  });
  element.dispatchEvent(event);
}

/**
 * Simulate keyboard input
 */
function simulateKeyboardInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Simulate click event
 */
function simulateClick(element: HTMLElement): void {
  element.click();
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

/**
 * Get element when it becomes visible
 */
async function waitForVisible(selector: string, options: WaitOptions = {}): Promise<HTMLElement> {
  const { timeout = 30000, interval = 500 } = options;
  const startTime = Date.now();

  while (true) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.offsetParent !== null) {
      return element;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for visible element: ${selector}`);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Check if element is visible
 */
function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null;
}

/**
 * Scroll element into view
 */
function scrollIntoView(element: HTMLElement, behavior: ScrollBehavior = "smooth"): void {
  element.scrollIntoView({ behavior, block: "center" });
}

/**
 * Get all elements matching selector
 */
function queryAll<T extends Element = Element>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

/**
 * Find element by text content
 */
function findByText(text: string, tag = "*"): HTMLElement | null {
  const elements = Array.from(document.querySelectorAll(tag));
  return (elements.find((el) => el.textContent?.trim() === text) as HTMLElement) || null;
}

/**
 * Find element by partial text content
 */
function findByTextIncludes(text: string, tag = "*"): HTMLElement | null {
  const elements = Array.from(document.querySelectorAll(tag));
  return (elements.find((el) => el.textContent?.includes(text)) as HTMLElement) || null;
}

/**
 * Create element with attributes
 */
function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "class") {
      element.className = value as string;
    } else if (key in element) {
      (element as unknown as Record<string, unknown>)[key] = value as unknown;
    } else {
      element.setAttribute(key, String(value));
    }
  });

  return element;
}

/**
 * Add styles to element
 */
function addStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

/**
 * Inject CSS into page
 */
function injectCSS(css: string, id?: string): HTMLStyleElement {
  const style = document.createElement("style");
  if (id) style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

/**
 * Remove injected CSS
 */
function removeCSS(id: string): void {
  const style = document.getElementById(id);
  if (style) style.remove();
}

export {
  waitForElement,
  waitForElements,
  waitForElementRemoval,
  waitForElementObserver,
  simulateInput,
  simulateKeyboardInput,
  simulateClick,
  waitForVisible,
  isVisible,
  scrollIntoView,
  queryAll,
  findByText,
  findByTextIncludes,
  createElement,
  addStyles,
  injectCSS,
  removeCSS,
};
export type { WaitOptions, ObserverOptions };
