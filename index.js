/**
 *
 * 3 Way Difference for objects to determine conflicts/edits
 *
 * @package 3-way-diff
 * @author Shawn Walsh
 * @author Markham F Rollins IV
 *
 */

'use strict';

// Dependencies
var _ = require('lodash');

/**
 * 3-way-diff Constructor
 *
 * @param {object} parent - Object with parent values
 * @param {object} theirs - Object with their changes
 * @param {object} mine - Object with my changes
 * @param {object} options - Key specific options for diff
 * @returns {Array} - Array of objects specifying the differences
 */
module.exports = function(parent, theirs, mine, options) {
  options = options || {};

  if(!_.isPlainObject(parent)) {
    throw new Error('Parent must be an object');
  }
  if(!_.isPlainObject(theirs)) {
    throw new Error('Theirs must be an object');
  }
  if(!_.isPlainObject(mine)) {
    throw new Error('Mine must be an object');
  }

  if(_.isEqual(parent, theirs) && _.isEqual(theirs, mine)) {
    return [];
  }

  return recurse(parent, theirs, mine, [], options);
};

/**
 * Recursively traverse the objects to handle 3-way-diff
 *
 * @param {object} parent - Object with parent values
 * @param {object} theirs - Object with their changes
 * @param {object} mine - Object with my changes
 * @param {array} path - Path to value in parent/theirs/mine
 * @param {object} options - Key specific options for diff
 * @returns {Array} - Array of objects specifying the differences
 */
function recurse(parent, theirs, mine, path, options) {
  var path = path || [];
  var results = [];

  // Handle all the keys that exist in mine
  _.forOwn(mine, function(value, key) {
    results = results.concat(processKeyValuePair(key, value, parent, theirs, mine, path, options));
  });

  // Handle all the keys that exist in parent but not mine
  _.forOwn(parent, function(value, key) {
    // Skip all keys that exist in mine
    if (_.isUndefined(mine[key])) {
      results = results.concat(processKeyValuePair(key, value, parent, theirs, mine, path, options));
    }
  });

  return results;
}

/**
 * Determine process in which key/value should be compared
 *
 * @param key - The current object key to dif
 * @param value - The current object value to diff
 * @param {object} parent - Object with parent values
 * @param {object} theirs - Object with their changes
 * @param {object} mine - Object with my changes
 * @param {array} path - Path to value in parent/theirs/mine
 * @param {object} options - Key specific options for diff
 * @returns {Array} - Array of objects specifying the differences
 */
function processKeyValuePair(key, value, parent, theirs, mine, path, options) {
  var results = [];

  // Only process keys that have no options, or have not been flagged as ignored
  if (_.isUndefined(options[key]) || (!_.isUndefined(options[key]) && !options[key]['ignoreKey'])) {
    if (!_.isArray(value) && !_.isObject(value)) {
      path.push(key);
      var differences = compareValues(parent[key], theirs[key], mine[key], path, options[key] || {});
      if (differences) {
        results = results.concat(differences);
      }
      path.pop();
    }
    else if (_.isArray(value)) {
      var array = value;
      // If single dimension array run the comparison
      if (value.filter(function (i) {
          return !_.isArray(i) && !_.isObject(i);
        }).length == value.length) {
        path.push(key);
        var differences = compareValues(parent[key], theirs[key], mine[key], path, options[key] || {});
        if (differences) {
          results = results.concat(differences);
        }
        path.pop(key);
      }
      _.forOwn(array, function (value, key) {
        if (!_.isArray(value) && !_.isObject(value)) {

        } else {
          // TODO handle arrays of arrays or objects
        }
      });
    }
    else if (_.isObject(value)) {
      path.push(key);
      var differences = recurse(parent[key], theirs[key], mine[key], path, options[key] || {});
      if (differences) {
        results = results.concat(differences);
      }
      path.pop();
    }
  }

  return results;
}

/**
 * Compare the values in parent/theirs/mine to determine type of conflict/edit (if any)
 *
 * @param {object} parent - Object with parent values
 * @param {object} theirs - Object with their changes
 * @param {object} mine - Object with my changes
 * @param {array} path - Path to value in parent/theirs/mine
 * @param {object} options - Key specific options for diff
 * @returns {*} - An object containing the conflict/edit, otherwise empty return
 */
function compareValues(parent, theirs, mine, path, options) {
  if (!_.isUndefined(options['falsy']) && options['falsy']) {
    if (!parent && !theirs && !mine) {
      // All are falsy, no conflict
    }
    else if (!parent && !theirs && mine) {
      // parent/theirs are equal (falsy), mine is different: 'E'
      return {
        kind: 'E',
        path: path.slice(),
        parent: parent,
        theirs: theirs,
        mine: mine
      };
    }
    else if (!parent && theirs && !mine) {
      // parent/mine are equal (falsy), theirs is different: 'C'
      return {
        kind: 'C',
        path: path.slice(),
        parent: parent,
        theirs: theirs,
        mine: mine
      };
    }
  }
  else if(_.isUndefined(parent) && _.isUndefined(theirs) && !_.isUndefined(mine)) {
    // Mine is new: 'N'
    return {
      kind: 'N',
      path: path.slice(),
      mine: mine
    };
  }
  else if(!_.isUndefined(parent) && !_.isUndefined(theirs) && _.isUndefined(mine)) {
    // Mine is missing: 'D'
    return {
      kind: 'D',
      path: path.slice(),
      parent: parent,
      theirs: theirs
    };
  }
  else if(_.isArray(parent) || _.isArray(mine) || _.isArray(theirs)) {
    // Maintain array order unless flagged as ignoreOrder
    if (!_.isUndefined(options) && options['ignoreOrder']) {
      parent = parent.sort();
      mine = mine.sort();
      theirs = theirs.sort();
    }
    if (!_.isEqual(parent, theirs) && !_.isEqual(parent, mine) && !_.isEqual(theirs, mine)) {
      // All 3 are different: 'C'
      return {
        kind: 'C',
        path: path.slice(),
        parent: parent,
        theirs: theirs,
        mine: mine
      };
    }
    if (_.isEqual(parent, theirs) && !_.isEqual(theirs, mine)) {
      // parent/theirs are equal, mine is different: 'E'
      return {
        kind: 'E',
        path: path.slice(),
        parent: parent,
        theirs: theirs,
        mine: mine
      };
    }
    if (_.isEqual(parent, mine) && !_.isEqual(theirs, mine)) {
      // parent/mine are equal, theirs is different: 'C'
      return {
        kind: 'C',
        path: path.slice(),
        parent: parent,
        theirs: theirs,
        mine: mine
      };
    } else {
      // All 3 are equal
    }
  }
  else if(parent !== theirs && parent !== mine && theirs !== mine) {
    // All 3 are different: 'C'
    return {
      kind: 'C',
      path: path.slice(),
      parent: parent,
      theirs: theirs,
      mine: mine
    };
  }
  else if(parent === theirs && theirs !== mine) {
    // parent/theirs are equal, mine is different: 'E'
    return {
      kind: 'E',
      path: path.slice(),
      parent: parent,
      theirs: theirs,
      mine: mine
    };
  }
  else if(parent === mine && theirs !== mine) {
    // parent/mine are equal, theirs is different: 'C'
    return {
      kind: 'C',
      path: path.slice(),
      parent: parent,
      theirs: theirs,
      mine: mine
    }
  }
  else {
    // All 3 are equal
  }
}