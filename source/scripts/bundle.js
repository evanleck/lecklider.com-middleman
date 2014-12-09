//= require geopattern.min.js

document.addEventListener('DOMContentLoaded', function(ev) {
  /* check for some nodes we might care about */
  var pattern = document.getElementById('pattern'),
      lemon   = document.getElementById('lemonsauce'),
      list    = document.getElementById('post-list');

  if (pattern) {
    var title   = document.title,
        geo_pattern = GeoPattern.generate(title);

    /* set that pattern */
    pattern.style.backgroundImage = geo_pattern.toDataUrl();
  };

  if (lemon) {
    var lizs     = ['liz-cando.jpg', 'liz-joker.jpg', 'liz-leia.jpeg', 'liz-nerdrage.gif', 'liz-wtw.gif', 'liz-lifeishappening.gif', 'liz-fresh-hell.gif', 'liz-hipsternonsense.gif'],
        selected = Math.floor((Math.random() * lizs.length));

    lemon.src = '/images/' + lizs[selected];
  };

  if (list) {
    var items = list.getElementsByTagName('li');

    for (var i = items.length - 1; i >= 0; i--) {
      /* create a span and insert it before the link */
      var item    = items[i],
          link    = item.getElementsByTagName('a')[0],
          span    = document.createElement('span'),
          pattern = GeoPattern.generate(link.textContent + ' | Evan Lecklider');

      /* spool up our span and then insert it */
      span.classList.add('pattern');
      span.style.backgroundImage = pattern.toDataUrl();

      item.insertBefore(span, link);
    };
  };
});