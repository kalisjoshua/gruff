/*jshint laxcomma:true strict:false*/
/*globals __dirname describe it module require*/

var
  assert = require("chai").assert
, fs = require("fs")
, terse  = require("../lib/terse");

function doozer (tag) {
  var
    act = terse(fs.readFileSync(__dirname + "/fixtures/" + tag + ".terse").toString()).toHTML()
  , exp = fs.readFileSync(__dirname + "/fixtures/" + tag + ".html").toString();

  return function () {
    assert.equal(act, exp);
  };
}

function loopio (tags) {
    Object.keys(tags).forEach(function (node) {
      node[0] === "?"
        ? it(node.slice(1))
        : it(node, doozer(tags[node]));
    });
}

describe("Terse", function () {
  it("should exist", function () {
    assert(terse);
  });

  describe("Block-level Elements", function () {

    loopio({
        "Blockquote"         : "blockquote"
      , "Code block"         : "code"
      , "Heading"            : "heading"
      , "Horizontal Rule"    : "hr"
      , "Image"              : "img"
      , "Descriptive List"   : "dl"
      , "Ordered List"       : "ol"
      , "Unordered List"     : "ul"
      , "Paragraph"          : "p"
      , "Pre-formatted text" : "pre"
      , "?Table"              : "table"
      });
    
  });

  describe("In-line Elements", function () {

    loopio({
        "?Bold"         : "b"
      , "?Code inline"  : "code-inline"
      // , "?Emphasis"     : "em"
      , "?Image"        : "img"
      , "?Italic"       : "i"
      , "?Link"         : "a"
      // , "?Strong"       : "strong"
      , "?Subscript"    : "sub"
      , "?Superscript"  : "sup"
      });

  });
});
