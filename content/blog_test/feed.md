---
[feeds]

[feeds.posts]
query = '.'
limit = 50
---

# Feed Testing

This is an index for the folder that contains a feed.

```
${o.feeds.posts.map(post => {
    return macro('post', {
        title: post.config.title, 
        content: post.config.description
    })
}).join('\n')}
```