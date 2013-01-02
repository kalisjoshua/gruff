Gruff
=====

A syntax for defining how to markup a document; similar to wiki-syntax and markdown.

Stealing from the philosphy of Markdown, readability is paramount; the look of the `.terse` document is to be as readable as possible without parsing. The balancing act is to remain simple and concise but offering enough features to remain relevant and usable; one thing terse is not attempting to become is a templating language such as Jade or Handlebars.

The output of parsing should always be valid htm. 

Markup is mesy, verbose, and I just don't love writing it. Other syntaxes are nice and work well but none have really fit my personal style.


# Blocks
---------

Blocks need to be processed first so that they properly markup the document in order and don't interfere with each other. Paragraphs are processed last since they are the catch-all for the portions of the document that don't fall into the rules of other elements.


## Block-quotes

    Lorem ipsum dolor sit amet consectuter adipsing elit.

        "A block-quote begins with a leading four (or more) spaces." ~ citation follows the tilde

    The rest of the text continues without the extra leading spaces


## Code

The format portion of the block - following the initial three back-ticks - will define the block as a code block and be added as the classname to the `code` element for styling purposes.

    ```format
    var myVar = "awesome";

    function describe (addition) {
      return "This code is " + addition;
    }

    describe(myVar);
    ```


## Headings

Heading will be lead off with a `=`. The number of `=` will indicate the level of the heading.

    = Level 1 Heading
    == Level 2 Heading
    === Level 3 Heading
    ==== Level 4 Heading
    ===== Level 5 Heading
    ====== Level 6 Heading

Of course there is the distinct possibility that someone will 'accidentally' create markup that is not valid. This is not the problem I am attempting to address.

    ======= Level 7 Heading Tag?
    ============== Level 14 Heading

These should fail silently to an h6 tag...? Let's not create invalid markup for no reason.


## Horizontal Rule (`<hr />`)

Any line that begins with `-` (dash, minus) characters - any number more than one - will be translated as a `<hr />`. All content on the line after the first few characters will be ignored.

    Lorem ipsum dolor sit amet.

    ---

    I personally think that three is enough to get the point across.


## Images

The syntax should be very similar to links (href) with a few extra options for additional information. Adding text to the `cation` and `classes` places will wrap the image in a `figure` tag and use a `figcaption`.

    [[image:http://link.to/image.png|alt|caption|classes]]


## Lists

Most of the beauty of HTML ordered lists is that they don't have an explicit order in the markup. I like `#` for numbered lists and `*` for bullets.

    * A bulleted
    * list.

    # A numeric
    # list.

    ? Description List (title)
    : title description
    : another description item


## Paragraphs

Any line that does not fall into any of the other rules should - most-likely - fall into a paragraph role.


## Pre(-formatted text)s

Use the same syntax as code, excluding the format declaration.

    ```
    This should be
    rendered as
    three lines of text.
    ```


## Tables

I don't want to do tables yet.


# In-line Elements
-------------------

In-line elements should attempt to be indicative of what formatting they represent and hopefully not obscure the readability of the text.


## Bold

    Next will be __text formatted as bold__ and the rest is normal.


## Code (snippets, one-liners)

Text referencing code with a regular block of text will still use the back-tick syntax but only one.

    An example might reference a variable `myVar` in some documentation piece.


## Images (sprites - small images in-line with text)

The syntax is the same as links, however, with the `image:` prefix attached to signify that it is an image and not a text link. Image tags have three pipe clauses: alt text info for the image tag, caption text for the `figcaption`, class names for the `figure` element.

    An example of an in-line image might be a [[image:http://link.to/smiley.gif|alt text|caption|class names]] no caption or float value because that would break the in-line-i-ness of it.


## Italics

Forward slashed were chosen due to their relative lack of use in plain text documents, as well as hinting at the slant the letters will take on.

    Next will be //text formatted in italics// and the rest is normal.


## Links

The square-bracket syntax might seem a little bulky but it will allow for spaces in pipe clauses more easily since they will be inside the brackets whereas without them how would the parser know when the options have quit and surrounding text started again.

    [[image:http://link.to/image.png|alt|caption|class names]]

    [[link:http://link.to/page|text|title|class names]]
    or
    [[http://link.to/page]]
    even
    http://link.to/page


### Footnote links - future feature?

Somewhere within the document there will need to be a link with the prefix of the number within the double-nested parentheses otherwise an error should be thrown since there is a reference to a non-existing link. This is a situation where the document has some resposibility to be valid since the footnote is attempting to shorthand a link.

    ((1))
    with 
    [[1:http://google.com|Google|Link to Google homepage]]


## Super/Sub script

    ^^one
    \\two
