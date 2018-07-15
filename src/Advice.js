import Symbol from './Symbol.js';

/**
 * AdviceMap, data structure for handling advices, instance of Map
 * @function
 * @param {object} target - The class in which the advice map will be created
 */
export const adviceMap = (target) => {
  let advices = target[Symbol.Advice];

  if (!target[Symbol.Advice]) {
    advices = new Map();
  }

  // eslint-disable-next-line
  return target[Symbol.Advice] = advices;
};

/**
 * Advisor, HOC interaction with advices
 * @function
 * @param {object} target - The class in which the advice map will be created
 */
export const Advisor = (target) => {
  const map = adviceMap(target);
  const get = name => map.get(name);

  const save = () => {
    target[Symbol.Advice] = map;
    return (target[Symbol.Advice] === map);
  };

  const set = (name, fn) => {
    if (!map.has(name)) {
      map.set(name, [fn]);
      return save();
    }
    return false;
  };

  const after = (name, fn) => {
    if (set(name, fn)) {
      return false;
    }
    const fns = map.get(name);
    map.set(name, [...fns, fn]);
    return save();
  };

  const before = (name, fn) => {
    if (set(name, fn)) {
      return false;
    }
    let fns = [...get(name)].reverse();
    fns.splice(1, 0, fn);
    fns = fns.reverse();
    map.set(name, fns);
    return save();
  };

  const around = (name, fn) => {
    if (set(name, fn)) {
      after(name, fn);
      return false;
    }
    return before(name, fn) && after(name, fn);
  };

  const call = (name, fn, args) => {
    let fns = [...get(name)].reverse();
    const idx = fns.findIndex(f => f === fn);
    fns = fns.slice(idx, fns.length).reverse();
    return fns.map(f => f.call(this, ...args));
  };

  const trigger = (name, index, ...args) => {
    let fns = [...get(name)];
    let idx = index;
    if (index < fns.length) { return Symbol.Bad; }
    if (index > fns.length) { idx = fns.length; }
    fns = fns.slice(0, idx);
    return fns.map(f => f.call(this, args));
  };

  return {
    map,
    // get,
    // save,
    call,
    trigger,
    set,
    after,
    before,
    around,
  };
};

const TheGoodOldTaoistAdvice = type => (target, name, descriptor) => {
  const advices = Advisor(target);
  const fn = descriptor.value;
  advices[type](name, fn);
  descriptor.value = (...args) => {
    advices.call(name, fn, args);
  };
  return descriptor;
};

const TGOTA = TheGoodOldTaoistAdvice;
export const advice = TGOTA('set');
export const after = TGOTA('after');
export const before = TGOTA('before');
export const around = TGOTA('around');
