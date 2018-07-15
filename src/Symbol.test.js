/* global it expect beforeEach describe */

import Symbol from './Symbol.js';

let sym;

describe('Symbol.Advice', () => {
  beforeEach(() => {
    sym = null;
  });

  it('dont heist Symbol', () => {
    sym = Symbol('test');

    expect(typeof sym).toBe('symbol');
    expect(sym.toString()).toBe('Symbol(test)');
  });

  it('use a proxy getter', () => {
    sym = Symbol.for('random');

    expect(typeof sym).toBe('symbol');
    expect(sym.toString()).toBe('Symbol(random)');
  });
});
