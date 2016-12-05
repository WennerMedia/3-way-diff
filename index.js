var _ = require('lodash');

module.exports = function(parent, theirs, mine) {
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

  return recurse(parent, theirs, mine);
};

function recurse(parent, theirs, mine, path) {
  var path = path || [];
  var results = [];

  // Handle all the keys that exist in mine
  _.forOwn(mine, function(value, key) {
    if(!_.isArray(value) && !_.isObject(value)) {
      path.push(key);
      var differences = compareValues(parent[key], theirs[key], mine[key], path);
      if(differences) {
        results = results.concat(differences);
      }
      path.pop();
    }
    else if(_.isArray(value)) {
      // TODO
    }
    else if(_.isObject(value)) {
      path.push(key);
      var differences = recurse(parent[key], theirs[key], mine[key], path);
      if(differences) {
        results = results.concat(differences);
      }
      path.pop();
    }
  });

  // TODO Handle all the keys that exist in parent but not mine
  _.forOwn(parent, function(value, key) {

  });

  return results;
}

function compareValues(parent, theirs, mine, path) {
  if(_.isUndefined(parent) && _.isUndefined(theirs) && !_.isUndefined(mine)) {
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

// From https://gist.github.com/tushariscoolster/567c1d22ca8d5498cbc0
function traverse(obj) {
  _.forIn(obj, function (val, key) {
    if (_.isArray(val)) {
      val.forEach(function(el) {
        if (_.isObject(el)) {
          traverse(el);
        }
      });
    }
    if (_.isObject(key)) {
      traverse(obj[key]);
    }
  });
}