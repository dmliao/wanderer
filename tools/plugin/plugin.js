class Plugin {
    getType() {
        // either ASSET or CONTENT
        return 'CONTENT';
    }

    getExtensions() {
        return ['md'];
    }

    parse(opts) {
        // override this
        
        return;
    }
}