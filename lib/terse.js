/*jshint laxcomma:true strict:false*/
/*globals module require*/

var
    BLOCKQUOTE  = '<figure><blockquote><p>$1</p></blockquote><figcaption>$3</figcaption></figure>'
  , CODE        = '<pre><code class="$1">$0</code></pre>'
  , CODELET     = '<code>$1</code>'
  , DD          = '<dd>$1</dd>'
  , DL          = '<dl>\n$0</dl>\n'
  , DT          = '<dt>$1</dt>'
  , EM          = '<em>$1</em>'
  , FIGURE      = '<figure class="$3"><img alt="$1" src="$0" /><figcaption>$2</figcaption></figure>'
  , HR          = "<hr />"
  , IMG         = '<img alt="$1" src="$0" />'
  , LINK        = '<a class="$3" href="$0" title="$2">$1</a>'
  , PARAGRAPH   = '<p>$1</p>'
  , PRE         = '<pre>$0</pre>'
  , STRONG      = '<strong>$1</strong>'
  , SUB         = '<sub>$1</sub> '
  , SUP         = '<sup>$1</sup> ';

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

// functions used by replace due to necessary logic in rendering
function fnCODE_PRE (match, $1, $2, $3) {
  match = $2
    ? f(CODE, $3, $2)
    : f(PRE, $3);

  return tokenizer(match, true);
}

function fnDL (match) {
  match = match
    .replace(/^\?\s+(.+)/gm, DT)
    .replace(/^\+\s+(.+)/gm, DD);

  return f(DL, match);
}

function fnH (match, $1, $2) {

  return f('<h$0>$1</h$0>', $1.length, $2);
}

function fnLI (list, leader) {
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

function fnLINK (match, $1, $2, $3, $4, $5) {
  [].forEach.call(arguments, function (item, indx, args) {
    args[indx] = item || "";
  });

  $1 = $1 === "image:";

  return $4 === "" && $5 === ""
    ? f($1 ? IMG : LINK, $2, (!$1 && !$3 ? $2 : $3), ($1 ? "" : $4), "")
    : f($1 ? FIGURE : LINK, $2, $3, $4, $5);
}

function render (src) {
  var
    result = src
    .replace(/^\s{4}((['"]).*\1)\s~\s(.*)$/gm, BLOCKQUOTE)
    .replace(/^(```)(\w*)\n+([^\1]*?)\n+\1/gm, fnCODE_PRE)
    .replace(/^(?:[\?\+]+\s+[^$\n]+\D)+/gm, fnDL)
    .replace(/^(?:([#\*]+)\s+[^$\n]+\D)+/gm, fnLI)
    .replace(/^-{3,}.*/gm, HR)
    .replace(/^(=[=\+]*)\s+(.*)/gm, fnH)
    .replace(/\[\[((?:image|link):)?([^\]\]]+?)(?:\|([\w\s\d]*))?(?:\|([\w\s\d]*))?(?:\|([\w\s\d]*))?\]\]/g, fnLINK)

    // paragraphs - needs to be last so that all other formatting will prevent paragraphs being where they shouldn't
    .replace(/^([^<\n].+)$/gm, PARAGRAPH)

    .replace(/`(.+?)`/g, CODELET)
    .replace(/__(.+?)__/g, STRONG)
    .replace(/\/\/(.+?)\/\//g, EM)
    .replace(/\\\\([^\s]+?)\s/g, SUB)
    .replace(/\^\^([^\s]+)\s/g, SUP);

  return tokenizer(result, false);
}

module.exports = function (src, delay) {
  return !delay
    ? render(src)
    : render.bind({}, src);
};
