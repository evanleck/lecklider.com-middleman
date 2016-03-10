---
title: Transparent Proxy Detection in JavaScript
date: 2015-11-16 11:26 PST
tags: JavaScript, Security
---

I recently found myself on the receiving end of a [transparent](https://en.wikipedia.org/wiki/Proxy_server#Transparent_proxy) [proxy](https://thevpn.guru/transparent-proxy-detect-expose-explain/). It wasn't a nefarious hacking attempt, simply a product demonstration from a partner's potential vendor, but it was disconcerting. Another website was pretending to be my company's site and if this site could do it, anybody could, potentially jeopardizing our customers' personal data. After all, our customers think they're logging into our site, but somebody else is creating a proxy and potentially altering the information in transit, putting anything that they enter on our site in jeopardy.

I stumbled on the issue through a happy coincidence: my site generates an email when a request looks like it has been forged. As a simple anti-request forgery measure, I use the [synchronizer token pattern](2014-08-21-csrf-prevention-in-sinatra.html) and when this method fails, I send myself the details of the request. It looks something like this:

```
CSRF Failed
POST @ domain.com/path
Referer: domain.com/path-two
Request History:
* GET @ domain.com/login
* GET @ domain.com
User Agent: UASTRING
```

What I noticed, though, was that the domains weren't matching up. As far as my server was concerned, it was behaving as it should, but the referers were all wrong!

To remedy this, I compare what the browser thinks the domain is against what the server thinks it is; I have Sinatra pass its values to the JavaScript running on the page in the form of the `proxyCheck` variable:

```html
<script>proxyCheck = { hostname: '<%= request.host %>', pathname: '<%= request.path %>' };</script>
```

and then I compare the host and path values to what the JavaScript thinks is going on and create a client-side redirect if they don't match. Check it out below.

```js
/*
 * This is a naive attempt to protect against transparent proxies.
 * - We pass the request host and path in from Rack and compare it against what JS sees.
 * - If they don't match, put them where they should be.
 *
 */
(function(location) {
  if (location.hostname !== proxyCheck.hostname || location.pathname !== proxyCheck.pathname) {
    /* Use an anchor tag as a parser. */
    var redirectParser = document.createElement('a');

    /* Grab the current, browser-side URL */
    redirectParser.href = location.href;

    /* Then munge the hostname, pathname, and port to match the server. */
    redirectParser.hostname = proxyCheck.hostname;
    redirectParser.pathname = proxyCheck.pathname;
    redirectParser.port = '';

    /* And redirect away. */
    window.top.location.replace(redirectParser.href);
  }
})(window.location);
```
