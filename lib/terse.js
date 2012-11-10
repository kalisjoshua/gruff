/*jshint laxcomma:true*/
/*globals module require*/

(function(){
  "use strict";

  var fn = {}
    , render_order = "";

  function f (str) {
    ([].slice.call(arguments, 1))
      .forEach(function (n, i) {
        str = str.split("$" + i).join(n || "");
      });

    return str;
  }

  function _l (str) {

    return str.slice(-1) === "#" ? "ol" : "ul";
  }

  // block elements need to be inlined for processing since terse processes based on lines
  // while processing blocks are inlined and returned to multiline before final return statement
  function nlInliner (str, tokenize) {
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

  // functions used by replace due to necessary logic in rendering
  function fnCODE_PRE (CODE, PRE) {
    return function (match, $1, $2, $3) {
      match = $2
        ? f(terse.templates[CODE], $3, $2)
        : f(terse.templates[PRE], $3);

      return nlInliner(match, true);
    };
  }

  function fnDL (DL, DT, DD) {
    return function (match) {
      match = match
        .replace(/^\?\s+(.+)/gm, terse.templates[DT])
        .replace(/^\+\s+(.+)/gm, terse.templates[DD]);

      return f(terse.templates[DL], match);
    };
  }

  function fnH (H) {
    return function (match, $1, $2) {
      return f(terse.templates[H], $1.length, $2);
    };
  }

  function fnLI () {
    return function (list, leader) {
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
    };
  }

  function fnLINK (FIGURE, IMG, LINK) {
    return function (match, $1, $2, $3, $4, $5) {
      // $1 label
      // $2 uri
      // $3 alt text
      // $4 caption
      // $5 CSS class(es)
      $1 = /image/i.test($1);
      $4 = $4 || "";
      $5 = $5 || "";

      return $4 === "" && $5 === ""
        ? f(($1 ? terse.templates[IMG] : terse.templates[LINK]), $2, (!$1 && !$3 ? $2 : $3), ($1 ? "" : $4), "")
        : f(($1 ? terse.templates[FIGURE] : terse.templates[LINK]), $2, $3, $4, $5);
    };
  }

  function terse (str) {
    str = render_order
      .reduce(function (acc, key) {
        var config = fn[key]
          , replacement;

        replacement = (config.func)
          ? config.func.apply(null, config.replacement)
          : terse.templates[config.replacement];

        return acc.replace(config.pattern, replacement);
      }, str);

    return nlInliner(str, false);
  }

  terse.render = function (name, pattern, replacement, func) {
    // TODO: error checking!
    if (arguments.length === 1) {
      return fn[name];
    }

    fn[name] = {
        func: func
      , pattern: pattern
      , replacement: replacement
    };

    return this;
  };

  terse.set_render_order = function (ord) {
    // as it is written, paragraphs need to be the last of the block elements
    // to prevent wrapping block element child lines in paragraph tags
    ord = ord || "BLOCKQUOTE CODE DL LI HR H LINK P LINKRAW CODELET STRONG EM SUB SUP";
    render_order = ord.split(" ");
  };

  terse.templates = {
      BLOCKQUOTE : '<figure><blockquote><p>$1</p></blockquote><figcaption>$3</figcaption></figure>'
    , CODE       : '<pre><code class="$1">$0</code></pre>'
    , CODELET    : '<code>$1</code>'
    , DD         : '<dd>$1</dd>'
    , DL         : '<dl>\n$0</dl>\n'
    , DT         : '<dt>$1</dt>'
    , EM         : ' <em>$1</em> '
    , FIGURE     : '<figure class="$3"><img alt="$1" src="$0" /><figcaption>$2</figcaption></figure>'
    , H          : '<h$0>$1</h$0>'
    , HR         : '<hr />'
    , IMG        : '<img alt="$1" src="$0" />'
    , LINK       : '<a class="$3" href="$0" title="$2">$1</a>'
    , LINKRAW    : ' <a href="$1" title="">$1</a> '
    , P          : '<p>$1</p>'
    , PRE        : '<pre>$0</pre>'
    , STRONG     : '<strong>$1</strong>'
    , SUB        : '<sub>$1</sub> '
    , SUP        : '<sup>$1</sup> '
  };

  terse.set_render_order();

  terse
    .render("BLOCKQUOTE", (/^\s{4}((['"]).*\1)\s~\s(.*)$/gm), "BLOCKQUOTE")
    .render("CODE",       (/^(```)(\w*)\n+([^\1]*?)\n+\1/gm), ["CODE", "PRE"], fnCODE_PRE)
    .render("CODELET",    (/`(.+?)`/g), "CODELET")
    .render("DL",         (/^(?:[\?\+]+\s+[^$\n]+\D)+/gm), ["DL", "DT", "DD"], fnDL)
    .render("EM",         (/\s\/\/(.+?)\/\/\s/g), "EM")
    .render("H",          (/^(=[=\+]*)\s+(.*)/gm), ["H"], fnH)
    .render("HR",         (/^-{3,}.*/gm), "HR")
    .render("LI",         (/^(?:([#\*]+)\s+[^$\n]+\D)+/gm), [], fnLI)
    .render("LINK",       (/\[\[((?:image|link):)?([^\]\]]+?)(?:\|([^\|\]]*?))?(?:\|([^\|\]]*?))?(?:\|([^\|\]]*?))?\]\]/g), ["FIGURE", "IMG", "LINK"], fnLINK)
    .render("LINKRAW",    (/\s(http[s]?:\/\/[^\s]+)\s/), "LINKRAW")
    .render("P",          (/^([^<\n].+)$/gm), "P")
    .render("STRONG",     (/__(.+?)__/g), "STRONG")
    .render("SUB",        (/\\\\([^\s]+?)\s/g), "SUB")
    .render("SUP",        (/\^\^([^\s]+)\s/g), "SUP");

  typeof module === 'undefined'
    ? this.terse = terse
    : module.exports = terse;

}());
