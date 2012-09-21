/*jshint laxcomma:true strict:false*/
/*globals module require*/

function f (str) {
  ([].slice.call(arguments, 1))
    .forEach(function (n, i) {
      str = str.replace("%" + i, n);
    });
  return str;
}

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
    var
      leaders = {"#":"ol","*":"ul"}

    , nl = "\n"

    , result = this.src
    // blockquote
    .replace(/^\s{4}((['"]).*\1)\s~\s(.*)$/gm, tagify("figure", tagify("blockquote", tagify("p", "$1")) + tagify("figcaption", "$3")))

    // code/pre blocks
    .replace(/^(```)(\w+)?\n+([^\1]*?)\n+\1/gm, function (match, $1, $2, $3) {
      match = $2
        ? tagify("pre", tagify("code", $3, ' class="' + $2 + '"'))
        : tagify("pre", $3);

      return tokenizer(match, true);
    })

    // lists
    .replace(/^(?:([#\*]+)\s*[^$\n]+[\n\W\D])+/gm, function (list, leader) {
        var stack = [];

        list = list
          .split(nl)
          .reduce(function (acc, node) {
            if (node) {
              node = node.match(/^([\*#]+)\s+(.*)/);
              node = { bullet: node[1], item: node[2] };

              if (stack[0] !== node.bullet) {
                if (stack[0] && stack[0].length > node.bullet.length) {
                  while (stack[0] !== node.bullet) {
                    acc += f("</li>\n</%0>\n", leaders[stack.shift().slice(-1)]);
                  }
                  acc += "</li>\n";
                } else {
                  stack.unshift(node.bullet);
                  acc += (stack.length > 1 ? nl : "") + f("<%0>\n", leaders[node.bullet.slice(-1)]);
                }
              } else {
                acc += "</li>\n";
              }

              return acc + "<li>" + node.item;
            } else {
              return acc;
            }
          }, "");

        while (stack.length) {
          list += f("</li>\n</%0>\n", leaders[stack.shift().slice(-1)]);
        }

        return list;
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
