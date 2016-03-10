---
title: Parsing GET Parameters in JavaScript
date: 2015-12-01 10:00 PST
tags: JavaScript
---

Pretty simple way to parse query string parameters into an object for access in JavaScript.

```js
/*
 * Params.js
 *
 * Super simple parser of query string parameters.
 * Creates a variable 'params' on the 'window' object.
 *
 */
(function() {
  var params     = {},
      capture    = void 0,
      query      = window.location.search.substring(1),
      whitespace = /\+/g,
      regex      = /([^&=]+)=?([^&]*)/g,
      decode     = function(s) {
        return decodeURIComponent(s.replace(whitespace, " "));
      };

  while (capture = regex.exec(query)) {
    var key   = decode(capture[1]),
        value = decode(capture[2]);

    if (value !== '') {
      params[key] = value;
    }
  }

  this.params = params;
}).call(this);
```
