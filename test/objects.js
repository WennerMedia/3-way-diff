var assert = require('assert');
var diff = require('../index.js');

describe('Complex Objects Diff', function() {
  it('parent is not an object', function() {
    assert.throws(function() { diff('', {}, {}); }, /Parent must be an object/);
  });

  it('theirs is not an object', function() {
    assert.throws(function() { diff({}, '', {}); }, /Theirs must be an object/);
  });

  it('mine is not an object', function() {
    assert.throws(function() { diff({}, {}, ''); }, /Mine must be an object/);
  });

  it('both children edit same nested key to different values', function() {
    var parent = {
      key: {
        childKey: 'value',
        childKey1: {
          subchildKey: 'value'
        }
      }
    };
    var theirs = {
      key: {
        childKey: 'value1',
        childKey1: {
          subchildKey: 'value'
        }
      }
    };
    var mine = {
      key: {
        childKey: 'value2',
        childKey1: {
          subchildKey: 'value'
        }
      }
    };
    var expected = [
      // Conflict on key modified in both theirs/mine
      {
        kind: 'C',
        path: [ 'key', 'childKey' ],
        parent: parent.key.childKey,
        theirs: theirs.key.childKey,
        mine: mine.key.childKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit different nested keys to different values, ignore key', function() {
    var parent = {
      keyIgnored: {
        childKey: 'value',
        childKey1: {
          subchildKey: 'value'
        }
      }
    };
    var theirs = {
      keyIgnored: {
        childKey: 'value',
        childKey1: {
          subchildKey: 'value1'
        }
      }
    };
    var mine = {
      keyIgnored: {
        childKey: 'value',
        childKey1: {
          subchildKey: 'value2'
        }
      }
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {keyIgnored: {ignoreKey: true}}), expected);
  });

  it('mine adds nested key that does not exist in parent/theirs', function() {
    var parent = {
      key: {
        childKey: 'value'
      }
    };
    var theirs = {
      key: {
        childKey: 'value'
      }
    };
    var mine = {
      key: {
        childKey: 'value',
        childKey1: {
          subChildKey: 'value1'
        }
      }
    };
    var expected = [
      {
        kind: 'N',
        path: [ 'key', 'childKey1'],
        mine: mine.key.childKey1
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine adds nested key that does not exist in parent/theirs, ignore key', function() {
    var parent = {
      keyIgnored: {
        childKey: 'value'
      }
    };
    var theirs = {
      keyIgnored: {
        childKey: 'value'
      }
    };
    var mine = {
      keyIgnored: {
        childKey: 'value',
        childKey1: {
          subchildKey: 'value1'
        }
      }
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {keyIgnored: {ignoreKey: true}}), expected);
  });

  it('mine add nested childKey where the parent is empty', function() {
    var parent = {

    };
    var theirs = {

    };
    var mine = {
      key: {
        childKey: 'value',
      }
    };
    var expected = [
      {
        kind: 'N',
        path: [ 'key'],
        mine: mine.key
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine add nested childKey where the parent/theirs key are null', function() {
    var parent = {
      key: null
    };
    var theirs = {
      key: null
    };
    var mine = {
      key: {
        childKey: 'value',
      }
    };
    var expected = [
      {
        kind: 'N',
        path: [ 'key', 'childKey'],
        mine: mine.key.childKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey where the parent key is null', function() {
    var parent = {
      key: null
    };
    var theirs = {
      key: {
        childKey: 'value',
      }
    };
    var mine = {
      key: {
        childKey: 'value',
      }
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey with different values where the parent key is null', function() {
    var parent = {
      key: null
    };
    var theirs = {
      key: {
        childKey: 'value',
      }
    };
    var mine = {
      key: {
        childKey: 'value1',
      }
    };
    var expected = [
      {
        kind: 'C',
        path: [ 'key', 'childKey'],
        mine: mine.key.childKey,
        theirs: theirs.key.childKey,
        parent: parent.key
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey where the parent key is null', function() {
    var parent = {
      key: null
    };
    var theirs = {
      key: {
        childKey: 'value'
      }
    };
    var mine = {
      key: {
        childKey: 'value',
      }
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey with different values where the parent key is null', function() {
    var parent = {
      key: null
    };
    var theirs = {
      key: {
        childKey: 'value1'
      }
    };
    var mine = {
      key: {
        childKey: 'value2',
      }
    };
    var expected = [
      {
        kind: 'C',
        path: [ 'key', 'childKey'],
        parent: parent.key,
        theirs: theirs.key.childKey,
        mine: mine.key.childKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey with same values that doesn\'t exist in the parent', function() {
    var parent = {
      key1: 'value'
    };
    var theirs = {
      key1: 'value',
      key2: {
        childKey1: 'value'
      }
    };
    var mine = {
      key1: 'value',
      key2: {
        childKey1: 'value'
      }
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine/theirs add nested childKey with different values that doesn\'t exist in the parent', function() {
    var parent = {
      key1: 'value'
    };
    var theirs = {
      key1: 'value',
      key2: {
        childKey1: 'value'
      }
    };
    var mine = {
      key1: 'value',
      key2: {
        childKey1: 'value1'
      }
    };
    var expected = [
      {
        kind: 'C',
        path: [ 'key2', 'childKey1'],
        parent: parent.key2,
        theirs: theirs.key2.childKey1,
        mine: mine.key2.childKey1
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('theirs added a nested childKey that doesn\'t exist in parent/mine', function() {
    var parent = {
      key1: 'value'
    };
    var theirs = {
      key1: 'value',
      key2: {
        childKey1: 'value'
      }
    };
    var mine = {
      key1: 'value'
    };
    var expected = [
      {
        kind: 'C',
        path: [ 'key2'],
        parent: parent.key2,
        theirs: theirs.key2,
        mine: mine.key2
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });
});

// TODO These are probably useful tests https://github.com/falsecz/3-way-merge/blob/master/test/test.coffee