---
title:  "Building Trello Cycles"
date:   2013-10-03
tags: JavaScript, CoffeeScript
---

Recently I built a little utility project for the fine people at [UserTesting.com](http://www.usertesting.com) to help them get some insights into project lifecycle and "cycle time," the time it takes any given project to move through pre-determined phases of the lifecycle. Hence, ["Trello Cycles."](http://trello-cycles.co)

Seeing as how [Trello](https://trello.com)'s API is damn robust and they have a sweet piece of JS to help with authentication and some basic API requests I decided to do the whole thing client side and give [Yeoman](http://yeoman.io) a try at the same time.

## Yeoman
The webapp generator for Yeoman is pretty sweet: it scaffolds out some basic JS, CSS, and HTML; sets up [Grunt](http://gruntjs.com) tasks for local testing with live reload and building to a destination folder; and has support for CoffeeScript, HTML5 Boilerplate, Twitter Bootstrap, and RequireJS.

### Grunt the Fuck?
Maybe I'm just not hip to the new JS jazz, but Gruntfiles make no fucking sense to me. Check out the [auto-generated Gruntfile.js for Trello Cycles](https://github.com/evanleck/trello-cycles/blob/master/Gruntfile.js) and the [Rakefile for my Sinatra Boilerplate project](https://github.com/evanleck/sinatra-boilerplate/blob/master/Rakefile). Both will build assets and run a development server (I realize there isn't perfect feature parity so an apples-to-apples comparison is impossible, what I'm digging at here isn't a functionality comparison) but I find the former damn near inscrutable and the latter generally more legible. It's a minor thing. Sort of.


## Statistics in JavaScript

[Turns out](http://soundbord.herokuapp.com) doing basic statistical work in JavaScript isn't super straight forward. Calculating something simple like the sum and mean (average) of an array of numbers isn't as easy as just calling `[1, 2, 3].sum()` or `[1, 2, 3].mean()`. Instead, you'd have to do something absolutely goofy looking like pass the array into a dedicated function like `arraySum([1, 2, 3])` and just looking at that makes my blood boil. Because I've been using Ruby so much I'm used to calling methods directly on objects and monkey patching core classes to do what I want so I decided I'd better get to it. (Sidenote: I think there's probably a discussion of encapsulation and API consistency in here along the lines of [Underscore](http://underscorejs.org/) vs. core extension, but I'm not ready for that one yet).

This script adds some basic mathematical methods to the Array prototype chain including:

* `max`
* `min`
* `median`
* `sum` which depends on `reduce`
* `mean` which depends on `sum`
* `variance` which gives you the [variance](http://en.wikipedia.org/wiki/Variance) of the set
* `stddev` which gives you the [standard deviation](http://en.wikipedia.org/wiki/Standard_deviation), or more simply the square root of the variance

With all of that, you can call `[1, 2, 3].sum()` and `[1, 2, 3].mean()` to your heart's content.

```coffeescript
# max
if "function" isnt typeof Array::max
  Array::max = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.max called on null or undefined")  if null is this or "undefined" is typeof this

    Math.max.apply null, this

# min
if "function" isnt typeof Array::min
  Array::min = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.min called on null or undefined")  if null is this or "undefined" is typeof this

    Math.min.apply null, this

# median
if "function" isnt typeof Array::median
  Array::median = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.median called on null or undefined")  if null is this or "undefined" is typeof this

    # locals
    sorted = @sort (a,b) => return a - b
    length = @length >>> 0
    half   = Math.floor length/2

    if length % 2
      return this[half]
    else
      return [this[half - 1], this[half]].mean()

# sum
# depends on Array.prototype.reduce to work properly.
# shim for that available here https://gist.github.com/evanleck/6418510
if "function" isnt typeof Array::sum
  Array::sum = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.sum called on null or undefined")  if null is this or "undefined" is typeof this

    @reduce (a, b) ->
      a + b

# mean
if "function" isnt typeof Array::mean
  Array::mean = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.mean called on null or undefined")  if null is this or "undefined" is typeof this

    length = @length >>> 0

    @sum()/length

# variance
if "function" isnt typeof Array::variance
  Array::variance = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.variance called on null or undefined")  if null is this or "undefined" is typeof this

    index  = 0
    length = @length >>> 0
    mean   = @mean()
    powed  = []

    # loop to generate powed
    while length > index
      continue unless @hasOwnProperty(index)
      powed.push Math.pow(this[index] - mean, 2)
      ++index

    # return mean of powed
    powed.mean()

# standard deviation
if "function" isnt typeof Array::stddev
  Array::stddev = ->
    "use strict"

    # throw on null
    throw new TypeError("Array.prototype.stddev called on null or undefined")  if null is this or "undefined" is typeof this

    # square root of variance
    Math.sqrt @variance()
```

