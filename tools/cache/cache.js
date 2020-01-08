const TAFFY = require('taffydb').taffy;
const fs = require('fs')
const path = require('path')
const frontmatter = require('../frontmatter/index')

class Cache {
    constructor(cacheDir, contentDir) {
        this.cacheDir = path.resolve(cacheDir)
        this.contentDir = path.resolve(contentDir)

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
            content.page = path.relative(this.contentDir, filePath)

            this.pageCache.merge(content, "page")
        }
    }

    db(query) {
        return this.pageCache(query)
    }

    getPage(relativePath) {
        return this.pageCache({ page: relativePath })
    }
}

module.exports = Cache