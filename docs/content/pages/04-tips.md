# Common Use Cases

## Blog Previous / Next Links in Footer

### In your layout:

```
<footer>
	<div id="prev">
		${o.previous ?
		`<a href="${o.previous.url}">Previous</a>
			<p>${o.previous.title}</p>
		` : ''}
    </div>
		${o.next ?
			`<div id="next"><a href="${o.next.url}">Next</a>
				<p>${o.next.title}</p>
			</div>` : ''}
</footer>
```

Note that regardless of whether the previous page exists, we create the prev div. This is so that even if there is no previous page, we still flex to justify-content so the next page appears on the right.

### In the CSS:

```

footer {
    display: flex;
    justify-content: space-between;
}

footer #next {
    text-align: right;
}

```

## Totally Flat Site

Want a flat URL structure even if the content has nested folders? In your site-level config (or in a config file at the project's root), add

```
dir = "."
```

to make all pages build at top-level. Index pages will be built with the name of the folder above the index, to avoid overwriting the site index.

> NOTE: if you have dir set to any other directory, the index will not be special cased, and will live alongside the rest of the files in the built directory.
