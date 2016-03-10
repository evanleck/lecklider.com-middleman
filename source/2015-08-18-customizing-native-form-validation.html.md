---
title: Customizing Native Form Validation
date: 2015-08-18 10:14 PDT
tags: JavaScript
---

JavaScript form validation is pretty awesome. If you add `<input type='email'>` to your document, the browser will check the user's input against what it considers a valid email format and (unless you're in Safari) prevent the form from submitting if the format does not match.

That's pretty awesome, until you see how differently browsers report errors back to users. Let's look at Firefox and Chrome when validating a required input field. Here's the test page:

```html
<html>
  <head>
    <style>
      /* just a little breathing room for screenshots */
      body { padding: 40px; }
    </style>
  <body>
    <form>
      <input type='email' required name='email'>
      <button type='submit'>
        Submit
      </button>
    </form>
```

Here's what Chrome looks like when you try to submit that form:

![Chrome's required behavior](/images/chrome-required.png)

And here's what Firefox looks like:

![Firefox's required behavior](/images/firefox-required.png)

That's ... _functional_ I guess, but not exactly attractive. Let's see if we can't get these behaviors more consistent as well as more attractive across browsers that support form validation.

## Constraint Validation and the ValidityState

In order to intercept the browser's default form validation behavior, we need to get familiar with the [HTML5 Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML#Constraint_Validation_API), the [available markup](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation), and the associated [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) interface. I'm not going to cover everything there and I leave it to you to get to grips with some of what's available, but I'll walk you through getting something up and running to intercept the submit event and report back on which pieces of the form are invalid.

## Customizing Form Validation

First, let's attach a function to the `submit` event of every form on our page. In order to actually receive the event, we'll need to turn `noValidate` on, otherwise the browser will simply stop the form from submitting before we get a chance to inspect it. We'll then attach the `validateForm` method which we will write shortly.

```js
var validateForm = function(submitEvent) {
  /* We'll fill this in incrementally. */
};

document.addEventListener('DOMContentLoaded', function() {
  var forms = document.querySelectorAll('form');

  for (var index = forms.length - 1; index >= 0; index--) {
    var form = forms[index];

    form.noValidate = true;
    form.addEventListener('submit', validateForm);
  }
});
```

So, `validateForm` is going to handle the business logic of determining:

1. Is the form valid? If not, stop all propagation and...
2. Which element is invalid?
3. Why is this element invalid?
4. Report problem back to user.

Not too bad. Let's get started:

### Form Validity

**Is the form valid?** The [`checkValidity`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement#Methods) method of the HTMLFormElement is what we're looking for here. It reports back the results of the browser's form validation attempt and returns a simple `Boolean`. So:

```js
if (!submitEvent.target.checkValidity()) {
  /* oh noes! */
} else {
  return true; /* everything's cool, the form is valid! */
}
```

### Which Element is Invalid

Now that we know something's wrong, let's look at our elements to determine where we're falling down:

```js
var form     = submitEvent.target,
    elements = form.elements;

/* Loop through the elements, looking for an invalid one. */
for (var index = 0, len = elements.length; index < len; index++) {
  var element = elements[index];

  if (element.willValidate === true && element.validity.valid !== true) {
    /* element is invalid, let's do something! */
    /* break from our loop */
    break;
  } /* willValidate && validity.valid */
}
```

### But Why?

OK, what's wrong with this element? Pretty simple, we just read the [validationMessage](http://www.html5rocks.com/en/tutorials/forms/constraintvalidation/#toc-validationMessage):

```js
var message = element.validationMessage,
```

### Let the User Know

Cool, now let's just report it back to the user!

```js
var message = element.validationMessage,
    parent  = element.parentNode,
    div     = document.createElement('div');

/* Add our message to a div with class 'validation-message' */
div.appendChild(document.createTextNode(message));
div.classList.add('validation-message');

/* Add our error message just after element. */
parent.insertBefore(div, element.nextSibling);

/* Focus on the element. */
element.focus();
```

## Altogether Now

Here's the entire `validateForm` function for reference:

```js
var validateForm = function(submitEvent) {
  if (!submitEvent.target.checkValidity()) {
    /* Seriously, hold everything. */
    submitEvent.preventDefault();
    submitEvent.stopImmediatePropagation();
    submitEvent.stopPropagation();

    var form     = submitEvent.target,
        elements = form.elements;

    /* Loop through the elements, looking for an invalid one. */
    for (var index = 0, len = elements.length; index < len; index++) {
      var element = elements[index];

      if (element.willValidate === true && element.validity.valid !== true) {
        var message = element.validationMessage,
            parent  = element.parentNode,
            div     = document.createElement('div');

        /* Add our message to a div with class 'validation-message' */
        div.appendChild(document.createTextNode(message));
        div.classList.add('validation-message');

        /* Add our error message just after element. */
        parent.insertBefore(div, element.nextSibling);

        /* Focus on the element. */
        element.focus();

        /* break from our loop */
        break;
      } /* willValidate && validity.valid */
    }
  } else {
    return true; /* everything's cool, the form is valid! */
  }
};
```

## BONUS!

If you want to override the `validationMessage` and unify it across all browsers, why not try something like this:

```js
/*
  Determine the best message to return based on validity state.
 */
var validationMessageFor = function(element) {
  var name = element.nodeName,
      type = element.type,

      /* Custom, reused messages. */
      emailMessage = "Please enter a valid email address.";

  /* Pattern is present but the input doesn't match. */
  if (element.validity.patternMismatch === true) {
    if (element.pattern == '\\d*') {
      return "Please only enter numbers.";
    } else {
      return element.validationMessage;
    }

  /* Type mismatch. */
  } else if (element.validity.typeMismatch === true) {
    if (name == 'INPUT' && type === 'email') {
      return emailMessage;
    } else if (name == 'INPUT' && type === 'tel') {
      return "Please enter a valid phone number.";
    } else {
      return element.validationMessage;
    }

  /* Required field left blank. */
  } else if (element.validity.valueMissing === true) {
    if (name == 'SELECT' || (name == 'INPUT' && type === 'radio')) {
      return "Please select an option from the list.";
    } else if (name == 'INPUT' && type === 'checkbox') {
      return "Please check the required box.";
    } else if (name == 'INPUT' && type === 'email') {
      return emailMessage;
    } else {
      return "Please fill out this field.";
    }

  /* Input is out of range. */
  } else if (element.validity.rangeOverflow === true || element.validity.rangeUnderflow === true) {
    var max = element.getAttribute('max'),
        min = element.getAttribute('min');

    return "Please input a value between " + min + " and " + max + ".";

  /* Default message. */
  } else {
    return element.validationMessage;
  }
};
```

That's it!

![Thumbs up](/images/liz-thumbs-up.gif)
