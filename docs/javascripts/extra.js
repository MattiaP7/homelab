document.addEventListener("DOMContentLoaded", () => {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    }
  }
});
