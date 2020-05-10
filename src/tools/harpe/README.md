# Harpe

Opinionated, stripped-down Markdown parser with configurable output. 

## Usage

```
import harpe from 'harpe.js'

const parser = harpe({...options})

...
// define any additional block or inline types here
// parser.defineBlockType(...)
// parser.defineInlineType(...)
...

parser.parse(text)

```

## Features

This only supports a _subset_ of Markdown by default, with the rules as follows:

# Heading 1

## Heading 2

### Heading 3

Normal paragraphs don't have anything at the beginning of the block.
Even single linebreaks are treated as paragraphs.

> Block quotes.

> To do a multiline quote,
> Begin each line with a '\>'

* Unordered lists.
* Note that because of the block restriction of 'wrap whole line', there are no sublists.
* I''ll work on that if I ever need it!

1. Ordered lists.
2. They're not very smart, so you can start with any number.

| table heading | description
| Tables | also work
| with the first row | being the heading.

Lines beginning with `= ` are treated as comments and stripped out.

```
Code blocks allow you to write anything in them without the content being formatted.
```

This, as well as a series of inline text:

**Bolded text** using the `**` syntax.

_Italic text_ using the `_` syntax.

[Links](#harpe) with inline Markdown syntax. No endnote syntax support.

Images also with inline Markdown syntax.

Though since the output is specifically HTML, I suppose you can just write <strong>raw HTML</strong> to have it show up, as well.

## API

**options**

| name | type | description
| verbose | boolean | prints out diagnostic information if set

**defineInlineType(name, { match: regex, out: string}, priority?: number)**

Defines a new rule for inline types (types which can operate within a block, but cannot span blocks). 

| parameter | description
| name | Used to identify the rule. Defining a name multiple times will overwrite the previous rule.
| match | A regex used to detect when to perform the rule. The rule will detect the match and then replace the match with the `out` string
| out | The HTML result used to replace the original Markdown. Uses the capturing groups from `match`, with `$1` being the first.

**defineBlockType(match: string, { open: string, close: string, tag: string }, priority?: number)**

Defines a new rule for block types (types that operate on an entire line of input text). All block types look for symbols at the beginning of the line, and then wrap the entire line in the given HTML tag.

| parameter | description
| match | The string at the beginning of the line that defines the block rule.
| open | String that defines the opening HTML tag to wrap the line in, including brackets. You can define this specifically to add classes or props to the tag.
| close | String that defines the closing HTML tag to wrap the line in, including brackets.
| tag | String that defines the HTML tag to wrap the line in, without brackets. Can substitute both the `open` and `close` parameters. The easiest to define, but does not allow for special casing.

**parse(text: string)**

Parses a string into HTML, using the given HTML configuration. The output can then be displayed in-browser.