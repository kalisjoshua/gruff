/*jshint laxcomma:true strict:false*/
/*globals module require*/

function tagify (tag, content, attr) {
  return "<%1%3>%2</%1>"
    .replace(/%3/, attr || "")
    .replace(/%1/g, tag)
    .replace(/%2/, content);
}

function Terse (src) {
  // let's get it started then
  this.src = src;
}

Terse.prototype = {
  toHTML: function (/*? options ?*/) {
    return this.src
      // blockquote
      .replace(/^\s{4}((['"]).*\1)\s~\s(.*)$/gm, tagify("figure", tagify("blockquote", tagify("p", "$1")) + tagify("figcaption", "$3")))

      // code blocks
      .replace(/(^`{3})(\w+)\n+([^\1]*?)\n+\1/gm, tagify("pre", tagify("code", "$3", ' class="$2"')))

      // pre(formatted text) blocks
      .replace(/(^`{3})\n+([^\1]*?)\n+\1/gm, tagify("pre", tagify("pre", "$2")))

      // title (h1-6) tags
      .replace(/^(=[=\+]*)\s+(.*)/gm, function (match, p1, p2) {
        return tagify("h" + p1.length, p2);
      });
  }
};

module.exports = function (src/*?, options ?*/, now) {
  return now
    ? new Terse(src).toHTML()
    : new Terse(src);
};
