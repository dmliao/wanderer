---
[feeds]

[feeds.posts]
query = '.'
limit = 50
---

# Feed Testing

This is an index for the folder that contains a feed.

!!!
${o.feeds.posts.map(post => {
    return macro('post', {
        title: post.title, 
        content: post.config.description
    })
}).join('\n')}
!!!

And here is a second way to write a feed:

!!!
${o.feeds.posts.map(post => {
    return md(`
# [${post.title}](${post.url})
${post.config.description}
`)
}).join('\n')}
!!!