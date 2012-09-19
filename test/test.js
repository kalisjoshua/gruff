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
      tags[node][0] === "?"
        ? it(tags[node])
        : it(tags[node], doozer(node));
    });
}

describe("Terse", function () {
  it("should exist", function () {
    assert(terse);
  });

  describe("Block-level Elements", function () {

    loopio({
        "all"         : "?Mixed bag of elements"
      , "blockquote"  : "Blockquote"
      , "code"        : "Code block"
      , "heading"     : "Heading"
      , "hr"          : "?Horizontal Rule"
      , "img"         : "?Image"
      , "dl"          : "?Descriptive List"
      , "ol"          : "?Ordered List"
      , "ul"          : "?Unordered List"
      , "p"           : "?Paragraph"
      , "pre"         : "Pre-formatted text"
      , "table"       : "?Table"
      });
    
  });

  describe("In-line Elements", function () {

    loopio({
        "b"       : "?Bold"
      , "codelet" : "?Code inline"
      , "em"      : "?Emphasis"
      , "img"     : "?Image"
      , "i"       : "?Italic"
      , "a"       : "?Link"
      , "strong"  : "?Strong"
      , "sub"     : "?Subscript"
      , "sup"     : "?Superscript"
      });

  });
});
