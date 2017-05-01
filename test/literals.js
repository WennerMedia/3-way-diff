var assert = require('assert');
var diff = require('../index.js');

describe('Literals Diff', function() {
  it('parent is not an object', function() {
    assert.throws(function() { diff('', {}, {}); }, /Parent must be an object/);
  });

  it('theirs is not an object', function() {
    assert.throws(function() { diff({}, '', {}); }, /Theirs must be an object/);
  });

  it('mine is not an object', function() {
    assert.throws(function() { diff({}, {}, ''); }, /Mine must be an object/);
  });

  it('no differences between the objects', function() {
    var parent = {
      key: 'value',
      child: {
        key1: 'value1'
      }
    };
    var theirs = {
      key: 'value',
      child: {
        key1: 'value1'
      }
    };
    var mine = {
      key: 'value',
      child: {
        key1: 'value1'
      }
    };
    var expected = [];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine edits key to different value', function() {
    var parent = {
      key: 'value',
      child: {
        key1: 'value1'
      }
    };
    var theirs = {
      key: 'value',
      child: {
        key1: 'value1'
      }
    };
    var mine = {
      key: 'value1',
      child: {
        key1: 'value2'
      }
    };
    var expected = [
      {
        kind: 'E',
        path: [ 'key' ],
        parent: parent.key,
        theirs: theirs.key,
        mine: mine.key
      }
      ,
      {
        kind: 'E',
        path: [ 'child', 'key1' ],
        parent: parent.child.key1,
        theirs: theirs.child.key1,
        mine: mine.child.key1
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine adds key that doesn\'t exist in parent/theirs', function() {
    var parent = {
      existingKey: 'value'
    };
    var theirs = {
      existingKey: 'value'
    };
    var mine = {
      existingKey: 'value',
      newKey: 'value1'
    };
    var expected = [
      {
        kind: 'N',
        path: [ 'newKey' ],
        mine: mine.newKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine removes key that exists in parent/theirs', function() {
    var parent = {
      existingKey: 'value'
    };
    var theirs = {
      existingKey: 'value'
    };
    var mine = {

    };
    var expected = [
      {
        kind: 'D',
        path: [ 'existingKey' ],
        parent: parent.existingKey,
        theirs: parent.existingKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('theirs edits key that doesn\'t exist in parent/mine', function() {
    var parent = {

    };
    var theirs = {
      missingKey: 'value'
    };
    var mine = {

    };
    var expected = [
      {
        kind: 'C',
        path: [ 'missingKey' ],
        parent: parent.missingKey,
        theirs: theirs.missingKey,
        mine: mine.missingKey
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit same key to same values', function() {
    var parent = {
      key: 'value',
    };
    var theirs = {
      key: 'value1'
    };
    var mine = {
      key: 'value1'
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit same key to different values', function() {
    var parent = {
      key: 'value'
    };
    var theirs = {
      key: 'value1'
    };
    var mine = {
      key: 'value2'
    };
    var expected = [
      // Conflict on key modified in both theirs/mine
      {
        kind: 'C',
        path: [ 'key' ],
        parent: parent.key,
        theirs: theirs.key,
        mine: mine.key
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit different keys to different values', function() {
    var parent = {
      keyTheirs: 'value',
      keyMine: 'value'
    };
    var theirs = {
      keyTheirs: 'value1',
      keyMine: 'value'
    };
    var mine = {
      keyTheirs: 'value',
      keyMine: 'value1'
    };
    var expected = [
      // Conflict on keyTheirs, Edit on keyMine
      {
        kind: 'C',
        path: [ 'keyTheirs' ],
        parent: parent.keyTheirs,
        theirs: theirs.keyTheirs,
        mine: mine.keyTheirs
      },
      {
        kind: 'E',
        path: [ 'keyMine' ],
        parent: parent.keyMine,
        theirs: theirs.keyMine,
        mine: mine.keyMine
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit same key to same values, ignore key', function() {
    var parent = {
      key: 'value',
    };
    var theirs = {
      key: 'value1'
    };
    var mine = {
      key: 'value1'
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key: {ignoreKey: true}}), expected);
  });

  it('both children edit same key to different values, ignore key', function() {
    var parent = {
      key: 'value'
    };
    var theirs = {
      key: 'value1'
    };
    var mine = {
      key: 'value2'
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key: {ignoreKey: true}}), expected);
  });

  it('both children edit different keys to different values, ignore keyIgnored', function() {
    var parent = {
      keyTheirs: 'value',
      keyMine: 'value',
      keyIgnored: 'value'
    };
    var theirs = {
      keyTheirs: 'value1',
      keyMine: 'value',
      keyIgnored: 'value1'
    };
    var mine = {
      keyTheirs: 'value',
      keyMine: 'value1',
      keyIgnored: 'value2'
    };
    var expected = [
      // Conflict on keyTheirs, Edit on keyMine
      {
        kind: 'C',
        path: [ 'keyTheirs' ],
        parent: parent.keyTheirs,
        theirs: theirs.keyTheirs,
        mine: mine.keyTheirs
      },
      {
        kind: 'E',
        path: [ 'keyMine' ],
        parent: parent.keyMine,
        theirs: theirs.keyMine,
        mine: mine.keyMine
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine, {keyIgnored: {ignoreKey: true}}), expected);
  });

  it('no difference between objects, key1 & key2 flagged as falsy', function() {
    var parent = {
      key1: '',
      key2: false
    };
    var theirs = {
      key1: 0,
      key2: NaN
    };
    var mine = {
      key1: null
      // key2 left undefined for test
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key1: {falsy: true}, key2: {falsy: true}}), expected);
  });

  it('mine edits key to non-falsy value, key flagged as falsy', function() {
    var parent = {
      key: '',
    };
    var theirs = {
      key: 0,
    };
    var mine = {
      key: 'value'
    };
    var expected = [
      {
        kind: 'E',
        path: [ 'key' ],
        parent: parent.key,
        theirs: theirs.key,
        mine: mine.key
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key: {falsy: true}}), expected);
  });

  it('both children edit same key to different values (theirs to non-falsy, mine to falsy), key flagged as falsy', function() {
    var parent = {
      key: '',
    };
    var theirs = {
      key: 'value',
    };
    var mine = {
      key: 0
    };
    var expected = [
      {
        kind: 'C',
        path: [ 'key' ],
        parent: parent.key,
        theirs: theirs.key,
        mine: mine.key
      }
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key: {falsy: true}}), expected);
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
});

// TODO These are probably useful tests https://github.com/falsecz/3-way-merge/blob/master/test/test.coffee