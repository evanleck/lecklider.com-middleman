//= require geopattern.min.js

document.addEventListener('DOMContentLoaded', function(ev) {
  /* check for some nodes we might care about */
  var patterns = document.querySelectorAll('[data-pattern]');

  for (var patternIndex = patterns.length - 1; patternIndex >= 0; patternIndex--) {
    var element = patterns[patternIndex],
        pattern = element.getAttribute('data-pattern'),
        geopat = GeoPattern.generate(pattern);

    element.style.backgroundImage = geopat.toDataUrl();
  }
});
