// https://stackoverflow.com/a/16348977
function stringToColour(string) {
  var hash = 0;

  for (var i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }

  return colour;
}

document.addEventListener('DOMContentLoaded', _ => {
  /* check for some nodes we might care about */
  Array.from(document.querySelectorAll('[data-pattern]')).forEach(element => {
    const pattern = element.getAttribute('data-pattern');

    element.style.backgroundColor = stringToColour(pattern)
  });
});
