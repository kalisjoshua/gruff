/*jshint laxcomma:true strict:false*/
/*globals module require*/


// utility function to check whether it's worth running through the wiki2html
function iswiki (s) {
    return !!(s.match(/^[\s{2} `#\*='{2}]/m));
}

// lists need to be done using a function to allow for recusive calls
function list(str) {
    return str
        // (?=[\*#])
        .replace(/(?:(?:(?:^|\n)[\*#].*)+)/g, function (m) {
            var type = m.match(/(^|\n)#/) ? 'ol' : 'ul';
            // strip first layer of list
            m = m.replace(/(^|\n)[\*#][ ]{0,1}/g, "$1");
            m = list(m);
            return '<' + type + '><li>' + m.replace(/^\n/, '').split(/\n/).join('</li><li>') + '</li></' + type + '>';
        });
}

// the regex beast...
module.exports = function (s) {
    
    return list(s
        
        /* BLOCK ELEMENTS */

        // paragraphs
        .replace(/(?:^|\n+)([^# =\*<].+)(?:\n+|$)/gm, function (m, l) {
            if (l.match(/^\^+$/)) {return l;}
            return "\n<p>" + l + "</p>\n";
        })

        // blockquotes
        .replace(/(?:^|\n)[ ]{2}(.*)+/g, function (m, l) {
            if (l.match(/^\s+$/)) {return m;}
            return '<blockquote>' + l + '</pre>';
        })
        
        // code
        .replace(/((?:^|\n)[ ]+.*)+/g, function (m) {
            if (m.match(/^\s+$/)) {return m;}
            return '<pre>' + m.replace(/(^|\n)[ ]+/g, "$1") + '</pre>';
        })

        // headings
        .replace(/(?:^|\n)([=]+)(.*)\1/g, function (m, l, t) {
            return '<h' + l.length + '>' + t + '</h' + l.length + '>';
        })
    
        /* INLINE ELEMENTS */

        // bold
        .replace(/'''(.*?)'''/g, function (m, l) {
            return '<strong>' + l + '</strong>';
        })
        
        // italic
        .replace(/''(.*?)''/g, function (m, l) {
            return '<em>' + l + '</em>';
        })
        
        // normal link
        .replace(/[^\[](http[^\[\s]*)/g, function (m, l) {
            return '<a href="' + l + '">' + l + '</a>';
        })
        
        // external link
        .replace(/[\[](http.*)[!\]]/g, function (m, l) {
            var p = l.replace(/[\[\]]/g, '').split(/ /)
            , link = p.shift();
            return '<a href="' + link + '">' + (p.length ? p.join(' ') : link) + '</a>';
        })
        
        // internal link or image
        .replace(/\[\[(.*?)\]\]/g, function (m, l) {
            var p = l.split(/\|/)
            , link = p.shift();

            if (link.match(/^Image:(.*)/)) {
                // no support for images - since it looks up the source from the wiki db :-(
                return m;
            } else {
                return '<a href="' + link + '">' + (p.length ? p.join('|') : link) + '</a>';
            }
        })
    );
};
