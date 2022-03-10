'use strict';

const {
  describe,
  beforeEach,
  afterEach,
  it,
} = require('mocha');
const assert = require('assert/strict');
const { Inspector } = require('../../src/lib/inspector');

let inspector;

beforeEach(async () => {
  inspector = new Inspector();
  await inspector.start();
});

afterEach(async () => {
  inspector.stop();
});

describe('inspector unit test', () => {
  it('getRemoteGlobal', async () => {
    const g = await inspector.getRemoteGlobal();
    assert.equal(g.type, 'object');
    assert.equal(g.className, 'global');
    assert.equal(g.description, 'global');
    assert.ok(g.objectId.length > 0);
  });

  it('getGlobalNames', async () => {
    const gn = await inspector.getGlobalNames();
    [
      'global',
      'clearInterval',
      'Function',
      'Array',
      'Infinity',
      'undefined',
      'constructor',
      'require',
      'ls',
      'cd',
      'util',
      '__proto__',
    ].forEach((name) => assert.ok(gn.includes(name), `Expected ${name}`));
  });

  it('evaluate', async () => {
    const source = '1 + 1';
    const actual = await inspector.evaluate(source, true);
    assert.deepStrictEqual(
      actual,
      {
        result: {
          description: '2',
          type: 'number',
          value: 2,
        },
      },
    );
  });

  it('evaluate with syntax error', async () => {
    const res = await inspector.evaluate('"', true);
    assert.equal(res.result.type, 'object');
    assert.equal(res.result.className, 'SyntaxError');
  });

  it('callFunctionOn', async () => {
    const f = 'function foo(arg) { return arg; }';
    const actual = await inspector.callFunctionOn(f, [{ value: 'abc' }]);
    assert.deepStrictEqual(
      actual,
      {
        result: {
          type: 'string',
          value: 'abc',
        },
      },
    );
  });

  describe('preview', () => {
    it('should not throw side effect with array', async () => {
      const actual = await inspector.preview('[1,2,3].map(x => x * x)');
      assert.deepStrictEqual(actual, '[ 1, 4, 9 ]');
    });

    it('should throw side effect this ls', async () => {
      const actual = await inspector.preview('[\'src\', \'test\'].map(e => ls(e))');
      assert.equal(actual, undefined);
    });
  });
});