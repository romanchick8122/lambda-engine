function defaultContext() {
    return {}
}
function parseNamedDefinition(def) {
    var idx = def.indexOf("=")
    if (idx < 0) {
        throw new IllFormedEroor(0);
    }
    return [def.substring(1, idx), JSON.stringify(parseLambda(def.substring(idx + 1)))]
}