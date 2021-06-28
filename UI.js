var lambdaBox = document.getElementById("lambdaBox");
var betaReductionButton = document.getElementById("betaReductionButton");
var normalFormButton = document.getElementById("normalFormButton");
var intermediateStepsBox = document.getElementById("intermediateStepsBox")

lambdaBox.addEventListener('keydown', e => {
    if (e.altKey && e.key == "l") {
        e.target.value += lambda
        return false;
    }
})

function getTermFromBox() {
    return lambdaBox.value.split("\n").pop();
}

betaReductionButton.addEventListener('click', e => {
    var term = parseLambda(getTermFromBox());
    var ans = applyNormalOrderReduction(term);
    if (!ans[1]) {
        alert("Term is in normal form");
    }
    lambdaBox.value += "\n" + getRepr(ans[0])
})