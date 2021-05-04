let GlobalVar = {
    inner: {},
    get(key) {
        return this.inner[key]
    },
    set(key, value) {
        this.inner[key] = value
    },
    updateAll(inner) {
        this.inner = inner;
    }
};


module.exports = GlobalVar;