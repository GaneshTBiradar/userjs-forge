export interface WaitOptions {
  timeout?: number;
  interval?: number;
  throwOnTimeout?: boolean;
}

export interface ObserverOptions {
  subtree?: boolean;
  childList?: boolean;
  attributes?: boolean;
  characterData?: boolean;
}
