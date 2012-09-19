/*jshint laxcomma:true strict:false*/
/*globals module require*/

function tagify (tag, content, attr) {
  return "<%1%3>%2</%1>"
    .replace(/%3/, attr || "")
    .replace(/%1/g, tag)
    .replace(/%2/, content);
}

function tokenizer (str, tokenize) {
  var
    NLs = "\n"
  , NLt = "~!salt-NL-salt!~"
  , rNL = new RegExp(NLs, "g")
  , rNT = new RegExp(NLt, "g");

  return tokenize
    // tokenize newlines for blocks with breaks
    ? str.replace(rNL, NLt)
    // de-tokenize newlines for readability
    : str.replace(rNT, NLs);
}

function Terse (src, options) {
  // let's get it started then
  this.src = src;
  this.setOptions(options);
}

Terse.prototype = {

  setOptions: function (opts) {
    this.options = opts;
  }

, toHTML: function (/*? options ?*/) {
    var result = this.src
      // blockquote
      .replace(/^\s{4}((['"]).*\1)\s~\s(.*)$/gm, tagify("figure", tagify("blockquote", tagify("p", "$1")) + tagify("figcaption", "$3")))

      // code/pre blocks
      .replace(/^(```)(\w+)?\n+([^\1]*?)\n+\1/gm, function (match, $1, $2, $3) {
        match = $2
          ? tagify("pre", tagify("code", $3, ' class="' + $2 + '"'))
          : tagify("pre", $3);

        return tokenizer(match, true);
      })

      // horizontal rule
      .replace(/^-{3,}.*/g, "<hr />")

      // title (h1-6) tags
      .replace(/^(=[=\+]*)\s+(.*)/gm, function (match, $1, $2) {
        return tagify("h" + $1.length, $2);
      })

      // paragraphs - needs to be last so that all other formatting will prevent paragraphs being where they shouldn't
      .replace(/^([^<\n].+)$/gm, tagify("p", "$1"));

    // TODO: make this an option
    return tokenizer(result, false);
  }
};

module.exports = function (src/*?, options ?*/, now) {
  return now
    ? new Terse(src).toHTML()
    : new Terse(src);
};
