---
title:  "Dumb Grids with Susy"
date:   2014-09-29
tags: CSS, Susy
---

[Susy might be my new favorite thing](http://susy.oddbird.net)&hellip; at least in CSS.

I say "dumb grids" with nothing but love, because in this case "dumb" means "not too magic and easy to grok". Without providing any configuration to Susy you can do this:

```scss
.container {
  @include container;

  /* this is our grid breakpoint, ~ a medium width */
  @media (min-width: 50em) {
    max-width: 50em;

    .half {
      @include span(1 of 2);
    }
    .third {
      @include span(1 of 3);
    }
    .half, .third {
      &.last {
        @include last;
      }
    }
  }

  /* this is our "desktop" width */
  @media (min-width: 65em) {
    max-width: 65em;
  }
}
```

So now, without having to define any grid settings, we have basic support for half- and third-width grids inside of containers that snap to fixed widths at breakpoints.

Neat, huh?