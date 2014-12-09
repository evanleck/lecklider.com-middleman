---
title: "Making Nginx &amp; WordPress Scream"
date: 2013-10-10
tags: Nginx, WordPress, PHP, Cache
---

WordPress is... interesting. It's sort of awesome and sort of The Worst<sup>&trade;</sup>. [PHP on its own certainly has its issues](http://me.veekun.com/blog/2012/04/09/php-a-fractal-of-bad-design/) but in particular, my experience with WordPress has been less than stellar because it is surprisingly fragile; its robustness and extensibility often lead to inscrutable errors and edge case bugs (third-party issues, but enabled by their systemic embrace); attempting to scale it at all efficiently quickly becomes a game of maintanence, optimization plugins, and indominable will; and as a matter of aesthetics, every WordPress blog looks like a fucking WordPress blog. Every. Oneofthem.

Nerdrage aside, having a nice GUI to work with and a quick way to slap a site together is valuable to a lot of people and companies. The savings involved probably outweigh the groans and grumbles of the developers who put the site together because ultimately, when the client needs to update the site, they can. So we charge on...

## Caching WordPress

The idea here is to get WordPress the fuck out of the way. That means PHP/MySQL shouldn't even get fired up for a "normal" request. Posts and pages are effectively static so why the hell should PHP have to get itself all worked up just to render out the same shit as last time? It shouldn't. Obviously.

To get the burden off of PHP we're going to bring [Nginx](http://nginx.org/) into play. Nginx is super good at serving files _suuuuper fast_ from disk (or RAM, whatever) so the first thing we're gonna do is get WordPress set up to compile flat, HTML versions of posts to disk so we can leverage Nginx's speed to get our site that much closer to "screamin' fast." You _miiight_ be able to get Apache to work for this setup, but in this case, Nginx's throughput and automatic FastCGI caching is really what we're looking for and Apache just doesn't have that (or at least I've not seen it).

[W3 Total Cache](http://wordpress.org/plugins/w3-total-cache/) is your best friend here because, aside from all of the other awesome shit it can do, it'll compile flat HTML versions of posts and pages. *JUST WHAT WE WANTED!* So head on into the settings and enable "Page Caching > Disk: Enhanced" to get WordPress ready for awesomeness.

Next up, let's get Nginx set up. I'll assume here that you've already gotten Nginx installed and pointed it at the base directory for your WordPress install. The trick now is to point Nginx first at the directory that W3 Total Cache writes cached files to and then, only if there's nothing there, to PHP. So let's do this:

```nginx
set $cache_uri $request_uri;
if ($request_uri ~* "(.*)\?(.*)") {
	set $cache_uri $1;
}

location / {
	try_files /wp-content/cache/page_enhanced/$http_host/$cache_uri/_index.html $uri $uri/ /index.php;
}
```

Here we set a `$cache_uri` variable to the internal `$request_uri` value then check for and remove the query string to avoid trying to access wacky directories. Then we look to the directory that W3 writes its cached content to (`/wp-content/cache/page_enhanced/$http_host/`) and look for a folder named after the request URI with a file named `_index.html` in it. That's our flat HTML, superduperfast version of that page and that's what we want to serve to the client.

This is huge. We've now taken PHP & MySQL out of the equation for the bulk of the requests to our WordPress site, but we can do more. We can make it better. Let's add [Nginx's awesome FastCGI caching](http://nginx.org/en/docs/http/ngx_http_fastcgi_module.html). Here's an abbreviated version of the Nginx config that'll get us there:

```nginx
http {
  fastcgi_temp_path  /var/run/nginx-cache 1 2;
  fastcgi_cache_path /var/run/nginx-cache levels=1:2 keys_zone=WORDPRESS:500m inactive=3m;

  set $cache_uri $request_uri;
  if ($request_uri ~* "(.*)\?(.*)") {
    set $cache_uri $1;
  }

  server {
    fastcgi_cache_min_uses  1;
    fastcgi_cache_key       "$scheme$request_method$host$cache_uri";
    fastcgi_cache_methods   GET HEAD;
    fastcgi_cache_use_stale error timeout invalid_header http_500;
    fastcgi_cache_valid     200 301 302 304 1h;

    location ~ \.php {
      fastcgi_cache WORDPRESS;
      fastcgi_cache_valid  60m;
    }
  }
}
```

Let's break this down a bit:

* `fastcgi_cache_path` tells Nginx where to store the cache (duh) and the parameter `inactive` does something special though: when a cache key hasn't been accessed for the designated period of time (in this case three minutes), the key gets expired. Simple, but powerful.
* `$cache_uri` should look familiar: it's the same thing we had earlier. We break apart the request URI to get just the path portion.
* `fastcgi_cache_use_stale` tells Nginx to continue to serve any valid cache keys if the upstream server (PHP in our case) fails to respond for any reason.

It's pretty simple and with this in place, we have a pretty robust system capable of handling _loads_ of traffic with nary a moments notice. Like, fucking *loads* of traffic.

So yeah, it's screamin' now.

**Update 2013 October 14:**

For reference, I was running four load balanced, non-optimized, c1.medium servers in EC2 with Apache+PHP serving the same site that totally crumbled around 3,000 active users. Four fucking servers.

With this set up, I've got one server (same c1.medium in EC2) that handled _~ 3,900 users and never spiked above 15% CPU utilization_.

I know, I can hardly believe it myself.

![Hipster Nonsense](/images/liz-hipsternonsense.gif)
