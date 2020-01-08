const TAFFY = require('taffydb').taffy;
const fs = require('fs')
const path = require('path')
const frontmatter = require('../frontmatter/index')

class Cache {
    constructor(cacheDir) {
        this.cacheDir = path.resolve(cacheDir)

        this.pageCachePath = path.join(this.cacheDir, 'pages.json')
        if (fs.existsSync(this.pageCachePath)) {
            this.pageCache = TAFFY(fs.readFileSync(this.pageCachePath, 'utf-8'))
        } else {
            this.pageCache = TAFFY()
        }
    }

    save() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true })
        }

        fs.writeFileSync(this.pageCachePath, this.pageCache().stringify());
    }

    update(touchedFiles) {
        const textFiles = ['md', 'htm']
        for (let file of touchedFiles) {
            const ext = path.extname(file.file).toLowerCase().slice(1)

            if (textFiles.indexOf(ext) < 0) {
                continue;
            }

            const filePath = path.join(file.dir, file.file)

            const content = frontmatter(fs.readFileSync(filePath, 'utf-8'))
            content.config = {...file.config, ...content.config}

            // TODO: we need to have run tempo by now to get the proper dates for prefixed posts.
            content.date = content.config.date
            content.id = file.id
            content.sourceDir = path.dirname(file.id)

            this.pageCache.merge(content, "id")
        }
    }

    db(query) {
        return this.pageCache(query)
    }
    
    global() {
        return this.pageCache
    }

    getPage(id) {
        const pages = JSON.parse(this.pageCache({ id: id }).limit(1).stringify())
        if (!pages.length) {
            return undefined
        }
        return pages[0]
    }

    getFeed({query, sortBy, isAscending, limit, pageNumber }) {
        if (!query) {
            throw new Error('no query?');
        }

        sortBy = sortBy || 'date'
        const sortType = isAscending ? 'asec' : 'desc'
        limit = limit || 1000 // if a site goes over this number we're really in trouble
        pageNumber = pageNumber || 0 // 0 indexed
        const pages = JSON.parse(this.pageCache(query)
            .limit(limit)
            .start(limit * pageNumber)
            .order(sortBy + ' ' + sortType).stringify())
        
        return pages
    }
}

module.exports = Cache