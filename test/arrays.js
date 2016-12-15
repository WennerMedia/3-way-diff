var assert = require('assert');
var diff = require('../index.js');

describe('Array Diff', function() {
  it('both children edit same key to same array values', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: [1, 2, 3]
    };
    var mine = {
      key: [1, 2, 3]
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit same key to same array values in different order, order is required', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: [3, 2, 1]
    };
    var mine = {
      key: [1, 3, 2]
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

  it('both children edit same key to same array values in different order, order is not required', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: [3, 2, 1]
    };
    var mine = {
      key: [1, 3, 2]
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine, {key: {ignoreOrder: true}}), expected);
  });

  it('both children edit same key to different array values', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: [1, 2, 3, 4]
    };
    var mine = {
      key: [1, 2, 3, 4, 5]
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

  it('both children edit different keys to different array values', function() {
    var parent = {
      keyTheirs: [1, 2, 3],
      keyMine: [1, 2, 3]
    };
    var theirs = {
      keyTheirs: [1, 2, 3, 4],
      keyMine: [1, 2, 3]
    };
    var mine = {
      keyTheirs: [1, 2, 3],
      keyMine: [1, 2, 3, 4]
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

  it('both children edit same key to same literal values', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: 'value'
    };
    var mine = {
      key: 'value'
    };
    var expected = [
      // No differences
    ];
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('mine edits key to different literal value', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: [1, 2, 3]
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
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });

  it('both children edit same key to different literal values', function() {
    var parent = {
      key: [1, 2, 3]
    };
    var theirs = {
      key: 'value'
    };
    var mine = {
      key: 'value1'
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
    assert.deepEqual(diff(parent, theirs, mine), expected);
  });
});

// TODO These are probably useful tests https://github.com/falsecz/3-way-merge/blob/master/test/test.coffee