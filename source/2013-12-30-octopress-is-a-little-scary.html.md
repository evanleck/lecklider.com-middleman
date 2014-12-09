---
title: "Octopress is a Little Scary"
date:   2013-12-30
---

I decided to try out the venerable [Octopress](http://octopress.org/) recently. I've been fascinated by static site generators for a while and since I run this site on [Jekyll](http://jekyllrb.com/), the foundation for Octopress, I thought I'd dig around a bit and see what was what.

## A Critique Born From Love

I'm going to be critical of Octopress here but I hope to not just troll. I played around with it a bit and these were my experiences, whether they're right, wrong, accurate, or totally stupid is immaterial. I learned a lot from just digging around in Octopress and I'm fucking _stoked_ that it exists. But man...

## So Many Tentacles

Like, a ton of tentacles. There's so much going on in Octopress that's near inscrutable at times. It's a complicated beast that does a lot of complicated stuff to bolt nice features onto Jekyll but I had a hard time wrapping my head around it because it seems so... well... bolted on.

Check out the [category generator](https://github.com/imathis/octopress/blob/628e0e4d9ab6d251991fb93b187f10eebff3d7a8/plugins/category_generator.rb) and tell me if you can make heads or tails of that. I can't, or more accurately, I'd rather not. How about the [setup process](http://octopress.org/docs/setup/), wherein you clone the entire repository (and therefore its history) into your site? Now, assuming I get to the point where I'd like to look through my history of changes, I'll see a huge backlog of completely irrelevant commits that I didn't make. It's not a deal breaker by any means, but it's annoying.

Jekyll is straight forward enough and single-purposed enough that I can grok it and work within its limitations. Octopress seems like it's trying to be everything and in doing so, approaches inscrutability.

## That Fuckin' Rakefile

This is really what blew me away: it [rewrites itself during execution](https://github.com/imathis/octopress/blob/d7a4bf5fc0c35f461c0d75796070203376d1b538/Rakefile#L354). The Rakefile rewrites itself while it's parsing itself!! WAT? I'm impressed, seriously. That's a ballsy move.

I've not really got an endgame here, I just found the whole experience interesting.
