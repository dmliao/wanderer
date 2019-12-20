// harpe
// v 0.1.1

// a stripped-down version of markdown where all of the tags and HTML can be defined via options

const harpe = options => {
    options = options || {}
  
    // configuration
    ////////////////////
  
    // block configuration
  
    /*
    configurableBlockType typing:
   
    stringToMatch[key]: {
      tag: string // used if you just want <tag></tag> syntax. Does not include the brackets.
      open: opening tag. Will supercede 'tag'. Can be used to add classes and props to the block
      close: closing tag. Will supercede 'tag'.
      wrap: a tag that defines the html element that wraps the item. In the current implementation, you cannot add classes to wraps.
      
      // optional tag
      _p: number - the smaller the number, the earlier the rule is resolved.
    }
   
    You need either tag or open and close or open and tag.
    */
    const blockTypes = options.blockTypes || {
      "# ": { tag: "h1", _p: 1 },
      "## ": { tag: "h2", _p: 2 },
      "### ": { tag: "h3", _p: 3 },
      "* ": { tag: "li", wrap: 'ul', _p: 4 },
      "> ": { tag: "blockquote", _p: 5 }
    };
  
    /*
    specialBlocks can't easily be edited.
    */
    const specialBlocks = {
      "= ": "comment",
      "| ": "table",
      "```": "code",
      "---": "hr"
    };
  
    const codeBlockTags = ["<pre><code>", "</code></pre>"];
  
    // inline configuration
  
    /*
    customInline typing:
   
    name: {
      match: regex,
      out: string // A string that defines the output HTML of the inline rule. Uses the capturing groups of the regex. $1 for the first group, $2 for the second, etc.
      // Example: <strong>$1</strong> - note that it includes both the open and close tags.
    }
    */
    const inlineTypes = options.inlineTypes || {
      strong: { match: /\*\*(\S(.*?\S)?)\*\*/gm, out: "<strong>$1</strong>", _p: 10 }, // only matches ** version
      em: { match: /_(\S(.*?\S)?)_(?![A-z])/gm, out: "<em>$1</em>", _p: 11 }, // only matches _ version
      code: { match: /`(\S.*?)`/gm, out: "<code>$1</code>", _p: 12 },
      link: {
        match: /\[((?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])+)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*?)\s*\)/gm,
        out: '<a href="$2">$1</a>', // $1 is the content of the link. $2 is the href.
        _p: 5
      },
      image: {
        match: /!\[((?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*?)\s*\)/gm,
        out: '<img alt="$1" src="$2" />', // $1 is the image's alt text. $2 is the source.
        _p: 1
      }
    };
  
    // helper functions
    ///////////////////////
  
    const split = string => {
      const newline = /\r\n|\r|\n/g;
      return string.split(newline);
    };
  
    const sortByPriority = (map) => {
      const array = []
      for (let item in map) {
        array.push({ id: item, ...map[item] })
      }
  
      return array.sort((a, b) => {
        return a._p - b._p
      })
    }
  
    const parseInlineRegex = text => {
      let processedString = text;
  
      for (let inlineType of sortByPriority(inlineTypes)) {
        processedString = processedString.replace(inlineType.match, inlineType.out)
      }
      return processedString;
    };
  
    const wrap = (text, before, after) => {
      const processedText = parseInlineRegex(text);
      return `${before}${processedText}${after}`;
    };
  
    const wrapReplace = (text, replace) => {
      const processedText = parseInlineRegex(text);
      return replace.replace('$1', processedText);
    }
  
    // public API
    ////////////////
  
    const defineBlockType = (match, newType, priority) => {
      // type checking
      let valid = false;
      if (newType.tag) {
        valid = true;
      } else if (newType.open && newType.close) {
        valid = true;
      }
  
      if (!valid) {
        console.warn("Adding invalid block type. You need either a plain string 'tag' or HTML 'open' and 'close' properties")
      }
      blockTypes[match] = newType
      blockTypes[match]._p = blockTypes[match]._p || priority || 10
    }
  
    const defineInlineType = (name, newType, priority) => {
      if (inlineTypes[name]) {
        inlineTypes[name] = { ...inlineTypes[name], ...newType }
        inlineTypes[name]._p = inlineTypes[name]._p || priority || 10
        return
      }
  
      // type checking
      if (!newType.match || !newType.out) {
        console.warn("Adding invalid inline type. The type needs a 'match', which is a regex to match the syntax, and an 'out', which uses capturing groups to replace the string with HTML")
        return
      }
      inlineTypes[name] = newType
      inlineTypes[name]._p = inlineTypes[name]._p || priority || 10
    }
  
    const parse = string => {
      if (options.verbose) {
        console.time('harpe')
      }
      const lines = split(string);
  
      // global vars
      let finalString = "";
      let isInCode = false;
      let previousBlock = undefined;
      let needsWrap = false;
  
      const closeTagIfNeeded = newBlock => {
        if (newBlock === previousBlock) {
          return;
        }
        if (!needsWrap) {
          previousBlock = newBlock;
          return;
        }
        needsWrap = false;
        finalString += `</${previousBlock}>\n`;
        previousBlock = newBlock;
      };
  
      const openTag = tag => {
        closeTagIfNeeded(tag);
        if (!needsWrap) {
          finalString += `<${tag}>\n`;
          needsWrap = true;
          return true;
        }
        return false;
      };
  
      const processTable = (line, header) => {
        const entries = line.split("|");
        let tableString = "";
        for (let entry of entries) {
          if (header) {
            tableString += wrap(entry.trim(), "<th>", "</th>");
          } else {
            tableString += wrap(entry.trim(), "<td>", "</td>");
          }
        }
        return wrap(tableString, "<tr>", "</tr>");
      };
  
      for (let line of lines) {
        if (isInCode) {
          if (line.startsWith("```")) {
            finalString += codeBlockTags[1] + "\n";
            isInCode = false;
            continue;
          }
          finalString += line + "\n";
          continue;
        }
  
        if (line.trim().length === 0) {
          closeTagIfNeeded(undefined);
          continue;
        }
  
        let type = "";
  
        // special cases
        for (let s in specialBlocks) {
          if (!line.startsWith(s)) {
            continue;
          }
          type = specialBlocks[s];
          break;
        }
  
        switch (type) {
          case "comment":
            continue; // don't do any more processing on this line
          case "code":
            finalString += codeBlockTags[0];
            isInCode = !isInCode;
            continue;
          case "table":
            const isNewTable = openTag("table");
  
            const textWithoutRune = line.slice(2).trim();
            finalString += processTable(textWithoutRune, isNewTable) + "\n"; // TODO: implement this!
            continue;
          case "hr":
            if (line.trim() === '---') {
                finalString += '</hr>\n'
                continue;
            }
            
        }
  
        // now we check if it's a regular block
        let processedBlock = false;
        for (let b in blockTypes) {
          if (!line.startsWith(b)) {
            continue;
          }
  
          const tagDefinition = blockTypes[b];
          if (tagDefinition.wrap) {
            openTag(tagDefinition.wrap);
          }
          const textWithoutRune = line.slice(b.length);
          finalString += wrap(textWithoutRune, tagDefinition.open || `<${tagDefinition.tag}>`, tagDefinition.close || `</${tagDefinition.tag}>`) + "\n";
          processedBlock = true;
          break;
        }
  
        if (processedBlock) {
          continue;
        }
  
        // it's just a normal paragraph
        closeTagIfNeeded("p");
        finalString += wrap(line, "<p>", "</p>") + "\n";
      }
  
      closeTagIfNeeded(undefined);
  
      if (options.verbose) {
        console.timeEnd('harpe')
      }
  
      return finalString;
    };
  
    return { defineBlockType, defineInlineType, parse };
  };
  
  // usage:
  // const md = harpe()
  // md.defineBlockType(...) // do additional configuration here.
  // md.parse(text)
module.exports = harpe;
  