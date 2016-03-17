---
title: The Simplest JavaScript Internationalization I Can Think Of
date: 2015-12-01 10:00 PST
tags: JavaScript, I18n
---

I found myself in need of a really simple implementation of I18n in JavaScript, but without a ton of overhead because the use case was pretty straightforward. I really just want to be able to do this in my form handlers:

```js
return i18n.forms.numberPatternMismatch;
```

So, I decided to extract the language from the HTML element (since I set it appropriately in the backend using [I18n](https://github.com/svenfuchs/i18n)) and set up localization files in JavaScript that I could then reference.

```js
//= require locales/en.js
//= require locales/es.js
/*
 * Set a global variable `i18n` that contains the current localization strings.
 *   Locale files create simple objects, we just map it in based on the 'lang' attribute
 *   of the HTML node.
 */
(function(window, undefined) {
  var currentLocale  = window.document.documentElement.lang,
      generalLocale  = currentLocale.split('-')[0],
      fallbackLocale = 'en';

  window.i18n = (function(locales) {
    if (generalLocale in locales) {
      return locales[generalLocale];
    } else {
      return locales[fallbackLocale];
    }
  })(window.locales);
})(window);
```

And my "locale" file for English:

```js
/*
 * English language translations for use in JavaScript.
 */
(function(window, undefined) {
  if (window.locales === undefined) {
    window.locales = {};
  }

  window.locales.en = {
    forms: {
      /* Form validation messages. */
      checkboxValueMissing: "Please check the required box.",
      emailFormat: "Please enter a valid email address.",
      numberPatternMismatch: "Please only enter numbers.",
      patternMismatch: "Please only enter numbers.",
      phone: "Please enter a valid phone number.",
      selectValueMissing: "Please select an option from the list.",
      valueMissing: "Please fill out this field.",
      amountRangeOutOfBounds: function(min, max) {
        return "Please input a load amount between $" + min + " and $" + max + ".";
      },

      /* Form submission messages. */
      cancelText: "Nevermind",
      confirmText: "I'm Sure",
      workingValue: "Working…",
    }
  };
})(window);
```

Simple enough, right?!
