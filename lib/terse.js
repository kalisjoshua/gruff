/*jshint laxcomma:true strict:false*/
/*globals module require*/

function f (str) {
  ([].slice.call(arguments, 1))
    .forEach(function (n, i) {
      str = str.replace(new RegExp("%" + i, "g"), n);
    });
  return str;
}

function _l (str) {
  return str.slice(-1) === "#" ? "ol" : "ul";
}

function tagify (tag, content, attr) {
  return f("<%0%2>%1</%0>", tag, content, attr || "");
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

function Terse (src) {
  this.src = src;
}

Terse.prototype = {
  BLOCKQUOTE: tagify("figure", tagify("blockquote", tagify("p", "$1")) + tagify("figcaption", "$3"))
, HR: "<hr />"
, PARAGRAPH: tagify("p", "$1")

, fnCODE_PRE: function (match, $1, $2, $3) {
    match = $2
      ? tagify("pre", tagify("code", $3, ' class="' + $2 + '"'))
      : tagify("pre", $3);

    return tokenizer(match, true);
  }

, fnH: function (match, $1, $2) {

    return tagify("h" + $1.length, $2);
  }

, fnLI: function (list, leader) {
    var stack = [];

    list = list
      .split("\n")
      .reduce(function (acc, node) {
        if (node) {
          node = node.match(/^([\*#]+)\s+(.*)/);
          node = { bullet: node[1], item: node[2] };

          if (stack[0] !== node.bullet) {
            if (stack[0] && stack[0].length > node.bullet.length) {
              while (stack[0] !== node.bullet) {
                acc += f("</li>\n</%0>\n", _l(stack.shift()));
              }
              acc += "</li>\n";
            } else {
              stack.unshift(node.bullet);
              acc += (stack.length > 1 ? "\n" : "") + f("<%0>\n", _l(node.bullet));
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
      list += f("</li>\n</%0>\n", _l(stack.shift()));
    }

    return list;
  }

, toHTML: function (/*? options ?*/) {
    var
      prot = Terse.prototype
    , result = this.src
      .replace(/^\s{4}((['"]).*\1)\s~\s(.*)$/gm, prot.BLOCKQUOTE)
      .replace(/^(```)(\w+)?\n+([^\1]*?)\n+\1/gm, prot.fnCODE_PRE)
      .replace(/^(?:([#\*]+)\s*[^$\n]+[\n\W\D])+/gm, prot.fnLI)
      .replace(/^-{3,}.*/g, prot.HR)
      .replace(/^(=[=\+]*)\s+(.*)/gm, prot.fnH)

      // paragraphs - needs to be last so that all other formatting will prevent paragraphs being where they shouldn't
      .replace(/^([^<\n].+)$/gm, prot.PARAGRAPH);

    return tokenizer(result, false);
  }
};

module.exports = function (src/*?, options ?*/, now) {
  return now
    ? new Terse(src).toHTML()
    : new Terse(src);
};
