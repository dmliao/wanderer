class Plugin {

    constructor() {
        this.types = {
            ASSET: 'ASSET',
            CONTENT: 'CONTENT',
        };
    }
    
    getType() {
        // either ASSET or CONTENT
        return this.types.CONTENT;
    }

    getExtensions() {
        return ['md'];
    }

    parse(opts) {
        // override this

        return;
    }
}

module.exports = Plugin;