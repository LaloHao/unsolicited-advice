/* eslint class-methods-use-this: off, lines-between-class-members: off */
/* global it expect beforeEach describe */

import {
  adviceMap,
} from './Advice.js';

import Symbol from './Symbol.js';

let Parent;
let Child;
let parent;
let child;
let map;
let fn;

describe('Abstract', () => {
  beforeEach(() => {
    Parent = class {
      isThisLove() {
        return 'yes';
      }
    };
    Child = null;
    parent = null;
    child = null;
    map = null;
    fn = null;
  });

  it('inheritance overrides methods unless explicit calls to super/parent component are made', () => {
    Child = class extends Parent {
      isThisLove() {
        // :(
        return 'no';
      }
    };
    parent = new Parent();
    child = new Child();

    expect(parent.isThisLove()).toBe('yes');
    expect(child.isThisLove()).toBe('no');

    Child = class extends Parent {
      isThisLove() {
        // return several values like a pro
        return super.isThisLove();
        return 'no';
      }
    };
    child = new Child();

    const TerribleThings = parent.isThisLove() === child.isThisLove();
    expect(TerribleThings).toBe(true);
  });

  it('simply storing the methods on a variable before they get overriden solves the problem, but we can leverage ES6 more', () => {
    Parent = class {
      constructor() {
        this.badStore = [
          this.method1,
          this.method2,
          this.method3,
          this.method4,
        ];
      }

      method1() { return 1; }
      method2() { return 2; }
      method3() { return 3; }
      method4() { return 4; }
    };

    Child = class extends Parent {
      method1() { return 'lost'; }
      method2() { return 'lost'; }
      method3() { return 'lost'; }
      method4() { return 'lost'; }
    };

    parent = new Parent();
    child = new Child();

    expect(parent.method1()).toBe(1);
    expect(parent.method2()).toBe(2);
    expect(parent.method3()).toBe(3);
    expect(parent.method4()).toBe(4);

    expect(child.method1()).toBe('lost');
    expect(child.method2()).toBe('lost');
    expect(child.method3()).toBe('lost');
    expect(child.method4()).toBe('lost');

    expect(parent.badStore[0]()).toBe(1);
    expect(parent.badStore[1]()).toBe(2);
    expect(parent.badStore[2]()).toBe(3);
    expect(parent.badStore[3]()).toBe(4);
  });

  it('the Map object is a better storage', () => {
    Parent = class {
      constructor() {
        this.map = new Map([
          ['method1', this.method1],
          ['method2', this.method2],
          ['method3', this.method3],
          ['method4', this.method4],
        ]);
      }

      method1() { return 1; }
      method2() { return 2; }
      method3() { return 3; }
      method4() { return 4; }
    };

    parent = new Parent();

    fn = parent.map.get('method1');
    expect(fn()).toBe(1);

    fn = parent.map.get('method2');
    expect(fn()).toBe(2);

    fn = parent.map.get('method3');
    expect(fn()).toBe(3);

    fn = parent.map.get('method4');
    expect(fn()).toBe(4);

    fn = parent.map.get('method4');
    expect(fn()).toBe(4);
  });

  it('the Map inside Parent has a risk of name clashing and losing the methods given the property it uses to identify itself, but symbol can generate unique values and prevent it from happening', () => {
    Parent = class {
      constructor() {
        this.map = new Map([
          ['method1', this.method1],
          ['method2', this.method2],
          ['method3', this.method3],
          ['method4', this.method4],
        ]);
      }

      method1() { return 1; }
      method2() { return 2; }
      method3() { return 3; }
      method4() { return 4; }
    };

    parent = new Parent();

    // so far so good
    fn = parent.map.get('method1');
    expect(fn()).toBe(1);

    // but it's better to keep data safe
    parent.map = null;
    expect(parent.map).toBe(null);

    map = Symbol();
    Parent = class {
      constructor() {
        this[map] = new Map([
          ['method1', this.method1],
          ['method2', this.method2],
          ['method3', this.method3],
          ['method4', this.method4],
        ]);
      }

      method1() { return 1; }
      method2() { return 2; }
      method3() { return 3; }
      method4() { return 4; }
    };

    parent = new Parent();

    parent.map = null;
    expect(parent.map).toBe(null);

    // it's not gone (yet)
    fn = parent[map].get('method1');
    expect(fn()).toBe(1);
  });

  it('high order functions can encapsulate the issue', () => {
    Parent = class {
      method1() { return 1; }
      method2() { return 2; }
    };

    parent = new Parent();
    expect(parent.map).toBe(undefined);

    parent = new Parent();
    map = adviceMap(parent);
    expect(map.size).toBe(0);
  });
});
