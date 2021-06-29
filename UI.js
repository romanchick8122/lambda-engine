var lambdaBox = document.getElementById("lambdaBox");
var limitField = document.getElementById("limitField");
var betaReductionButton = document.getElementById("betaReductionButton");
var normalFormButton = document.getElementById("normalFormButton");
var intermediateStepsBox = document.getElementById("intermediateStepsBox");
var namedOutputBox = document.getElementById("namedOutputBox");

lambdaBox.addEventListener('keydown', e => {
    if (e.altKey && e.key == "l") {
        newPos = e.target.selectionStart + 1;
        e.target.value =
            e.target.value.substring(0, e.target.selectionStart)
            + lambda
            + e.target.value.substring(e.target.selectionEnd)
        e.target.selectionStart = newPos;
        e.target.selectionEnd = newPos;
        return false;
    }
})

function getTermFromBox() {
    return lambdaBox.value.split("\n").pop();
}
async function getContextFromBox() {
    var result = defaultContext()
    var termMapping = defaultTermMapping()
    var lines = lambdaBox.value.split("\n")
    for (var i = 0; i < lines.length; ++i) {
        if (lines[i][0] == "!") {
            var def = await parseNamedDefinition(lines[i]);
            result[def[0]] = JSON.stringify(def[1]);
            termMapping.push(def)
        }
    }
    return [result, termMapping];
}
function addTerm(term, termMapping) {
    if (namedOutputBox.checked)
        lambdaBox.value += "\n" + getRepr(term, termMapping)
    else
        lambdaBox.value += "\n" + getRepr(term, defaultTermMapping)
}

betaReductionButton.addEventListener('click', async e => {
    var term = parseLambda(getTermFromBox());
    var context = await getContextFromBox();
    var ans = applyNormalOrderReduction(term, context[0]);
    if (!ans[1]) {
        alert("Term is in normal form");
    }
    addTerm(ans[0], context[1])
    lambdaBox.scrollTop = lambdaBox.scrollHeight;
})
normalFormButton.addEventListener('click', async e => {
    var term = parseLambda(getTermFromBox());
    var context = await getContextFromBox();
    addTerm(await findNormalForm(term, parseInt(limitField.value),
        intermediateStepsBox.checked ? x => addTerm(x, context[1]) : x => {}, context[0]), context[1])
    lambdaBox.scrollTop = lambdaBox.scrollHeight;
})