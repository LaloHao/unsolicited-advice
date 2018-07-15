const Symbols = {
  Advice: Symbol('advice'),
  Before: Symbol('before'),
  After: Symbol('after'),
  Around: Symbol('around'),
  Bad: Symbol('bad'),
};

const handler = {
  get(target, prop) {
    if (Symbols[prop]) {
      return Symbols[prop];
    }
    return Reflect.get(target, prop);
  },
};

export default new Proxy(Symbol, handler);
