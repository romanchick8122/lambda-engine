function defaultContext() {
    return {}
}
function defaultTermMapping() {
    return []
}
async function parseNamedDefinition(def, context) {
    var idx = def.indexOf("=")
    if (idx < 0) {
        throw new IllFormedEroor(0);
    }
    if (def[1] == '!') {
        return [def.substring(2, idx), await findNormalForm(parseLambda(def.substring(idx + 1)), context)]
    }
    return [def.substring(1, idx), parseLambda(def.substring(idx + 1))]
}