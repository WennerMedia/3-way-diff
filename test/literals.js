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
});

// TODO These are probably useful tests https://github.com/falsecz/3-way-merge/blob/master/test/test.coffee