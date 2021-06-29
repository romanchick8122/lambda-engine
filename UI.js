var lambdaBox = document.getElementById("lambdaBox");
var limitField = document.getElementById("limitField");
var betaReductionButton = document.getElementById("betaReductionButton");
var normalFormButton = document.getElementById("normalFormButton");
var intermediateStepsBox = document.getElementById("intermediateStepsBox");

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
function getContextFromBox() {
    var result = defaultContext()
    var lines = lambdaBox.value.split("\n")
    for (var i = 0; i < lines.length; ++i) {
        if (lines[i][0] == "!") {
            var def = parseNamedDefinition(lines[i]);
            result[def[0]] = def[1];
        }
    }
    return result;
}
function addTerm(term) {
    lambdaBox.value += "\n" + getRepr(term)
}

betaReductionButton.addEventListener('click', e => {
    var term = parseLambda(getTermFromBox());
    var ans = applyNormalOrderReduction(term, getContextFromBox());
    if (!ans[1]) {
        alert("Term is in normal form");
    }
    addTerm(ans[0])
    lambdaBox.scrollTop = lambdaBox.scrollHeight;
})
normalFormButton.addEventListener('click', async e => {
    var term = parseLambda(getTermFromBox());
    addTerm(await findNormalForm(term, parseInt(limitField.value),
        intermediateStepsBox.checked ? x => lambdaBox.value += "\n" + x : x => {}, getContextFromBox()))
    lambdaBox.scrollTop = lambdaBox.scrollHeight;
})