# wanderer documentation

Wanderer is an opinionated static site generator written in Node.JS.

[Source Code](https://github.com/dmliao/wanderer)

Is it ready for production use? It's ready in the sense that I personally use it. But it's very much a tool that's made by me, _for_ me, and thus might not be suited to your needs.

---

## Prerequisites

wanderer requires Node.JS v12 and up, because it uses `Array.flats()` which doesn't exist on v10 or earlier. It's not currently available on npm because I never made a package for it, so requires you to install from git:

```
npm install git+ssh://git@github.com/dmliao/wanderer.git
```