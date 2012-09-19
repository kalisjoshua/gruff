/*jshint laxcomma:true strict:false*/
/*globals module require*/

function Terse (src) {
  // let's get it started then
  this.src = src;
}

Terse.prototype = {
  toHTML: function (/*? options ?*/) {
    return this.src;
  }
};

module.exports = function (src/*?, options ?*/, now) {
  return now
    ? new Terse(src).toHTML()
    : new Terse(src);
};
