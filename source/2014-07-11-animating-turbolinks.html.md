---
title: "Animating Turbolinks"
date: 2014-07-11
tags: JavaScript, CSS
---

I've been using [Turbolinks](https://github.com/rails/turbolinks/) (with [jquery.turbolinks](https://github.com/kossnocorp/jquery.turbolinks)) in a lot of my projects recently in an attempt to keep things fast while still doing most all of the rendering on the server. I like that Turbolinks more or less works out of the box without a ton of dependencies or set up and, <abbr title='in my opinion'>IMO</abbr>, speeds up page renders. The problem I ran up against was to add page transitions (like a swipe effect) to mobile pages. Since Turbolinks just swaps the body of the document without any incremental steps, it's a little tricky to effectively animate that transition. The way I ended up overcoming it was to use Turbolinks' event emissions to add classes to the HTML node and animate a child node with CSS transforms.

The CoffeeScript:

```coffeescript
# starting to fetch a new target page
$(document).on 'page:fetch', ->
  $(document.documentElement)
    .removeClass('loaded')

  $(document.documentElement)
    .addClass('loading')

# the page has been parsed and changed to the new version and on DOMContentLoaded
$(document).on 'page:change', ->
  $(document.documentElement)
    .removeClass('loading')


# is fired at the end of the loading process
$(document).on 'page:load', ->
  $(document.documentElement)
    .addClass('loaded')
```

The SCSS (the `@media` rule keeps this on mobile-only):

```scss
@media (max-width: $grid-float-breakpoint) {
  $duration: 0.15s;
  $swing: 150%;

  #page-content {
    @include transform(translate3d($swing, 0, 0));

    .loaded & {
      @include transform(none);
      @include transition(transform $duration ease-in-out);
    }

    .loading & {
      @include transform(translate3d(-#{ $swing }, 0, 0));
      @include transition(transform $duration ease-in-out);

      &:before {
        @include transform(translate3d($swing, 0, 0));

        -webkit-animation: pulse 3s infinite ease-in-out;
        -moz-animation: pulse 3s infinite ease-in-out;
        content: 'Loading...';
        display: block;
        font-size: 28px;
        left: 0;
        position: fixed;
        text-align: center;
        top: 100px;
        width: 100%;
      }
    }
  }
}

@-webkit-keyframes pulse {
  0%   { opacity: 0; }
  50%  { opacity: 0.3; }
  100% { opacity: 0; }
}
@-moz-keyframes pulse {
  0%   { opacity: 0; }
  50%  { opacity: 0.3; }
  100% { opacity: 0; }
}
```

So, we:

1. On `page:fetch` add the 'loading' class to the HTML, causing the `#page-content` node to swing hard left (the negative X translation) and appear to 'swipe away' off-screen (that's the `transition`).
2. On `page:change` we remove 'loading' from the HTML, causing `#page-content` to swing hard right (the positive X translation) so it resides in the wings of the page, invisible until...
3. We add the 'loaded' class to the HTML, removing any translation on the `#page-content` node, animating it into center position where it looks just fine and normal.

A note on Bootstrap: I'd used `translate3d(0, 0, 0)` for the 'loaded' state before but it totally breaks any instances of the Bootstrap modal whereas the `transform(none)` doesn't. The modals use a translate3d effect to slide them into view and for whatever reason the stacking of these effects doesn't play nice in Chrome.
