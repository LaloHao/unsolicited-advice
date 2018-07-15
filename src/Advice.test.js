/* global it expect beforeEach describe */

import {
  advice,
  after,
  before,
  around,
  adviceMap,
  Advisor,
} from './Advice.js';

import Symbol from './Symbol.js';

let Parent;
let Child;

let parent;
let child;

let advices;
let funcall;
let queue;
let fn;

describe('@advice', () => {
  beforeEach(() => {
    Parent = null;
    parent = null;
    Child = null;
    child = null;
    funcall = null;
    advices = null;
    queue = null;
    fn = null;
  });

  it('returns or create an advise map', () => {
    Parent = class {};
    parent = new Parent();

    advices = parent[Symbol.Advice];
    expect(advices).toBe(undefined);

    advices = adviceMap(parent);
    expect(advices.size).toBe(0);

    advices.set('fn', () => null);
    expect(parent[Symbol.Advice].size).toBe(1);
    expect(parent[Symbol.Advice]).toBe(advices);
  });

  it('@advice: adds function to a new queue and enables it to be adviced', () => {
    Parent = class {
      @advice
      identity(x) {
        return x;
      }
    };

    parent = new Parent();
    advices = parent[Symbol.Advice];
    expect(advices.size).toBe(1);
    queue = advices.get('identity');
    expect(queue.length).toBe(1);
    fn = queue[0];
    expect(fn(queue)).toBe(queue);
    expect(fn('identity')).toBe('identity');
    // funcall = parent.identity;
    // console.log(funcall(1));
    // expect(funcall(1)).toBe(1);
  });

  it('advise @after: gets called after the parent function', () => {
    let str = '';

    Parent = class {
      @advice
      concat() {
        str += 'a';
        return str;
      }
    };

    Child = class extends Parent {
      @after
      concat() {
        str += 'b';
        return str;
      }
    };

    child = new Child();
    advices = child[Symbol.Advice];
    expect(advices.size).toBe(1);
    queue = advices.get('concat');
    expect(queue.length).toBe(2);
    expect(str).toBe('');
    child.concat();
    expect(str).toBe('ab');
  });

  it('advise @before: gets called before the parent function', () => {
    let str = '';

    Parent = class {
      @advice
      concat() {
        str += 'a';
        return str;
      }
    };

    Child = class extends Parent {
      @before
      concat() {
        str += 'b';
        return str;
      }
    };

    child = new Child();
    advices = child[Symbol.Advice];
    expect(advices.size).toBe(1);
    queue = advices.get('concat');
    expect(queue.length).toBe(2);
    expect(str).toBe('');
    child.concat();
    expect(str).toBe('b');
    // the chain triggers the method in order, so the parent isn't called

    str = '';
    // trigger chain manually
    const advisor = Advisor(child);
    advisor.trigger('concat', 10);
    expect(str).toBe('ba');
  });

  it('advise @around, gets called before and after the parent function', () => {
    let str = '';

    Parent = class {
      @advice
      concat() {
        str += 'a';
        return str;
      }
    };

    Child = class extends Parent {
      @around
      concat() {
        str += 'b';
        return str;
      }
    };

    child = new Child();
    advices = child[Symbol.Advice];
    expect(advices.size).toBe(1);
    queue = advices.get('concat');
    expect(queue.length).toBe(3);
    expect(str).toBe('');
    child.concat();
    expect(str).toBe('bab');
  });

  it('ignore if function wasnt called on parent to be advised, initialize it', () => {
    Parent = class {
      @after
      sleeping() {}
    };

    parent = new Parent();
    advices = adviceMap(parent);
    expect(advices.size).toBe(1);
    queue = advices.get('sleeping');
    expect(queue.length).toBe(1);

    Parent = class {
      @before
      sleeping() {}
    };

    parent = new Parent();
    advices = adviceMap(parent);
    expect(advices.size).toBe(1);
    queue = advices.get('sleeping');
    expect(queue.length).toBe(1);

    Parent = class {
      @around
      sleeping() {}
    };

    parent = new Parent();
    advices = adviceMap(parent);
    expect(advices.size).toBe(1);
    queue = advices.get('sleeping');
    expect(queue.length).toBe(2);

  });

  it('test trigger logic', () => {
    Child = class {
      @around
      sleeping() { return 'zzz'; }
    };

    child = new Child();
    const advisor = Advisor(child);
    let r = advisor.trigger('sleeping', -1);
    expect(r).toBe(Symbol.Bad);

    r = advisor.trigger('sleeping', 100);
    expect(r).toEqual(['zzz','zzz']);
  });

});
