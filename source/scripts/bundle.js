//= require geopattern.min.js

document.addEventListener('DOMContentLoaded', function(ev) {
  /* check for some nodes we might care about */
  var pattern = document.getElementById('pattern'),
      list    = document.getElementById('post-list');

  if (pattern) {
    var title  = document.title,
        geopat = GeoPattern.generate(title);

    /* set that pattern */
    pattern.style.backgroundImage = geopat.toDataUrl();
  }

  if (list) {
    var items = list.getElementsByTagName('li');

    for (var i = items.length - 1; i >= 0; i--) {
      /* create a span and insert it before the link */
      var item = items[i],
          link = item.getElementsByTagName('a')[0],
          span = document.createElement('span'),
          pat  = GeoPattern.generate(link.textContent + ' | Evan Lecklider');

      /* spool up our span and then insert it */
      span.classList.add('pattern');
      span.style.backgroundImage = pat.toDataUrl();

      item.insertBefore(span, link);
    }
  }
});