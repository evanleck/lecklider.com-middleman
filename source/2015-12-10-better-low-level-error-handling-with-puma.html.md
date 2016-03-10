---
title: Better Low-Level Error Handling with Puma
date: 2015-12-10 10:00 PST
tags: Puma, Ruby
---

[Puma](http://puma.io) has a neat little method you can call to override the behavior when it encounters an error in the [Rack](https://github.com/rack/rack) application it's running. If you've ever been running a Ruby application on Puma and seen the "call your local MayTag repairman" error message then you've hit the low-level error handler and know how jarring that can be. While it looks like the folks at Puma have since [updated the default message to be more meaningful](https://github.com/puma/puma/commit/bc4bd54616802dfb666e64048db6147785be847c), I still wanted something more customer-friendly for our sites at [Engage](http://www.engageft.com) so I overwrote the low-level error handler like so:

```ruby
# Inside of your Puma configuration file.
lowlevel_error_handler do
  [500, { 'Content-Type' => 'text/html' }, File.open('50x.html')]
end
```

And added a little more helpful HTML page with it:

```html
<!doctype html>
<html>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv='refresh' content='5'>
    <title>Temporarily Unavailable</title>
    <link rel='stylesheet' type='text/css' href='//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css'>
  </head>
  <body>
    <div class='container'>
      <div class='col-sm-offset-3 col-sm-6 text-center'>
        <br>
        <br>
        <h1>Temporarily Unavailable</h1>
        <br>
        <div class='well'>
          <p>We're sorry, we're experiencing a little trouble.</p>
          <p>We will be back shortly, but if you continue to see this error please <a href='mailto:service@cardserviceteam.com'>contact customer service</a>.</p>
          <hr>
          <p>Feel free to realod this page or <a href='/'>head back to the homepage</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>
```

Super simple, right?
