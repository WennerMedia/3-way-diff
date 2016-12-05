https://github.com/lodash/lodash/blob/master/lodash.js#L11220
**Note:** This method supports comparing arrays, array buffers, booleans,
    date objects, error objects, maps, numbers, `Object` objects, regexes,
    sets, strings, symbols, and typed arrays. `Object` objects are compared
    by their own, not inherited, enumerable properties. Functions and DOM
    nodes are **not** supported.

Structure of return object is loosely based on https://github.com/flitbit/diff

Some comparison is based on https://github.com/falsecz/3-way-merge/blob/master/test/test.coffee

// TODO Allow prefiltering to ignore certain fields

Concestor comes from https://github.com/dominictarr/xdiff

### Differences

Differences are reported as one or more change records. Change records have the following structure:

* `kind` - indicates the kind of change; will be one of the following:
    * `N` - indicates a newly added property/element
    * `D` - indicates a property/element was deleted
    * `E` - indicates a property/element was edited
    * `A` - indicates a change occurred within an array
    * `C` - indicates a conflicting change was made to both mine and theirs
* `path` - the property path (from the parent)
* `parent` - the value on parent (undefined if kind === 'A')
* `theirs` - the value on theirs (undefined if kind === 'N')
* `mine` - the value on mine (undefined if kind === 'D')
* `index` - when kind === 'A', indicates the array index where the change occurred
* `item` - when kind === 'A', contains a nested change record indicating the change that occurred at the array index