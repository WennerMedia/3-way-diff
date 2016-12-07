var _ = require('lodash');

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

function processKeyValuePair(key, value, parent, theirs, mine, path, options) {
  var results = [];

  if(!_.isArray(value) && !_.isObject(value)) {
    path.push(key);
    var differences = compareValues(parent[key], theirs[key], mine[key], path, options);
    if(differences) {
      results = results.concat(differences);
    }
    path.pop();
  }
  else if(_.isArray(value)) {
    var array = value;
    // If single dimension array run the comparison
    if (value.filter(function(i){
        return !_.isArray(i) && !_.isObject(i);
      }).length == value.length) {
      path.push(key);
      var differences = compareValues(parent[key], theirs[key], mine[key], path, options);
      if(differences) {
        results = results.concat(differences);
      }
      path.pop(key);
    }
    _.forOwn(array, function(value, key) {
      if(!_.isArray(value) && !_.isObject(value)) {

      } else {
        // TODO handle arrays of arrays or objects
      }
    });
  }
  else if(_.isObject(value)) {
    path.push(key);
    var differences = recurse(parent[key], theirs[key], mine[key], path);
    if(differences) {
      results = results.concat(differences);
    }
    path.pop();
  }

  return results;
}

function compareValues(parent, theirs, mine, path, options) {
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
  else if(_.isArray(parent) || _.isArray(mine) || _.isArray(theirs)) {
    // Maintain array order unless flagged as ignoreOrder
    if (typeof options[path] != 'undefined' && options[path]['ignoreOrder']) {
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