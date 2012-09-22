/*jshint laxcomma:true strict:false*/
/*globals module require*/

function f (str) {
  ([].slice.call(arguments, 1))
    .forEach(function (n, i) {
      str = str.split("$" + i).join(n);
      // str = str.replace(new RegExp("$" + i, "g"), n);
    });

  return str;
}

function _l (str) {

  return str.slice(-1) === "#" ? "ol" : "ul";
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
    // strings used by the replace method with match identifiers
    BLOCKQUOTE  : '<figure><blockquote><p>$1</p></blockquote><figcaption>$3</figcaption></figure>'
  , CODE        : '<pre><code class="$1">$0</code></pre>'
  , CODELET     : '<code>$1</code>'
  , EM          : '<em>$1</em>'
  , FIGURE      : '<figure class="$3"><img alt="$1" src="$0" /><figcaption>$2</figcaption></figure>'
  , HR          : "<hr />"
  , IMG         : '<img alt="$1" src="$0" />'
  , LINK        : '<a class="$3" href="$0" title="$2">$1</a>'
  , PARAGRAPH   : '<p>$1</p>'
  , PRE         : '<pre>$0</pre>'
  , STRONG      : '<strong>$1</strong>'
  , SUB         : '<sub>$1</sub> '
  , SUP         : '<sup>$1</sup> '

    // functions used by replace due to necessary logic in rendering
  , fnCODE_PRE: function (match, $1, $2, $3) {
      match = $2
        ? f(Terse.prototype.CODE, $3, $2)
        : f(Terse.prototype.PRE, $3);

      return tokenizer(match, true);
    }

  , fnH: function (match, $1, $2) {

      return f('<h$0>$1</h$0>', $1.length, $2);
    }

  , fnIMAGE: function (match, $1, $2, $3, $4, $5) {
      var prot = Terse.prototype;
      
      [].forEach.call(arguments, function (item, indx, args) {
        args[indx] = item || "";
      });

      $1 = $1 === "image:";

      return $4 === "" && $5 === ""
        ? f($1 ? prot.IMG : prot.LINK, $2, (!$1 && !$3 ? $2 : $3), ($1 ? "" : $4), "")
        : f($1 ? prot.FIGURE : prot.LINK, $2, $3, $4, $5);
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
                  acc += f("</li>\n</$0>\n", _l(stack.shift()));
                }
                acc += "</li>\n";
              } else {
                stack.unshift(node.bullet);
                acc += (stack.length > 1 ? "\n" : "") + f("<$0>\n", _l(node.bullet));
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
        list += f("</li>\n</$0>\n", _l(stack.shift()));
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
        .replace(/^-{3,}.*/gm, prot.HR)
        .replace(/^(=[=\+]*)\s+(.*)/gm, prot.fnH)
        .replace(/\[\[((?:image|link):)?([^\]\]]+?)(?:\|([\w\s\d]*))?(?:\|([\w\s\d]*))?(?:\|([\w\s\d]*))?\]\]/g, prot.fnIMAGE)

        // paragraphs - needs to be last so that all other formatting will prevent paragraphs being where they shouldn't
        .replace(/^([^<\n].+)$/gm, prot.PARAGRAPH)

        .replace(/`(.+?)`/g, prot.CODELET)
        .replace(/__(.+?)__/g, prot.STRONG)
        .replace(/\/\/(.+?)\/\//g, prot.EM)
        .replace(/\\\\([^\s]+?)\s/g, prot.SUB)
        .replace(/\^\^([^\s]+)\s/g, prot.SUP);

      return tokenizer(result, false);
    }
};

module.exports = function (src/*?, options ?*/, now) {
  return now
    ? new Terse(src).toHTML()
    : new Terse(src);
};
