/*
Syntax extensions to make it less flooded with brackets:
if A, B and C are terms, term (AB)C can be expressed with ABC
if A is a term, then λx.(λy.A) can be expressed with λxy.A
if A and B are terms, term λx.(AB) can be expressed with λx.AB

e.g.
λxy.x(λz.y)x would be parsed as λx.(λy.((x(λz.y))x))
 */

/*
Terms are represented as follows:
If variable is free, it is represented with
{
    type: "free",
    id: <variable id>
}
If variable is bound, it is represented with
{
    type: "bound",
    depth: <depth>
}
where <depth> is the depth of the representation compared to the abstraction defining this variable
Term obtained by abstraction rule (λx.A) is represented with
{
    type: "abstract",
    term: A
}
where A is representation of term A
Term obtained by application rule (AB) is represented with
{
    type: "apply",
    term1: A,
    term2: B
}
 */
var lambda = "λ"

class ParserError extends Error {
    constructor(message, position) {
        super(message + " at symbol " + position);
        this.name = "ParserError"
        this.position = position
    }
}
class IllFormedEroor extends ParserError {
    constructor(position) {
        super("Expression is ill-formed", position);
        this.name = "IllFormedEroor";
    }
}
class DoubleAbstractionError extends ParserError {
    constructor(position) {
        super("Variable used under lambda is already bound", position);
        this.name = "DoubleAbstractionError"
    }
}

function createBound(depth_) {
    return {
        type: "bound",
        depth: depth_
    }
}
function createFree(id_) {
    return {
        type: "free",
        id: id_
    }
}
function createAbstraction(term_) {
    return {
        type: "abstract",
        term: term_
    }
}
function createApplication(term1_, term2_) {
    return {
        type: "apply",
        term1: term1_,
        term2: term2_
    }
}
function isBound(term) {
    return term.type == "bound";
}
function isFree(term) {
    return term.type == "free";
}
function isAbstraction(term) {
    return term.type == "abstract";
}
function isApplication(term) {
    return term.type == "apply";
}

function parseLambda(repr) {
    return parseTerm(repr, {}, {}, 0, 0);
}
function parseTerm(repr, boundMapping, freeMapping, currentDepth, prefixLn) {
    //term is a variable
    if (repr.length == 1) {
        if (repr in boundMapping) {
            return createBound(currentDepth - boundMapping[repr]);
        }
        else if (repr in freeMapping) {
            return createFree(freeMapping[repr]);
        }
        else {
            newId = Object.keys(freeMapping).length;
            freeMapping[repr] = newId;
            return createFree(newId);
        }
    }
    //term is abstraction
    else if (repr[0] == lambda) {
        var abstracted = []
        var dotFound = false
        var i;
        for (i = 1; i < repr.length; ++i) {
            if (repr[i] == '.') {
                dotFound = true;
                break;
            }
            if (repr[i] in boundMapping) {
                throw new DoubleAbstractionError(i + prefixLn)
            }
            boundMapping[repr[i]] = currentDepth
            abstracted.push(repr[i])
            ++currentDepth;
        }
        if (!dotFound) {
            throw new IllFormedEroor(repr.length + prefixLn);
        }
        ++i;
        subterm = parseTerm(repr.substring(i), boundMapping, freeMapping, currentDepth, i + prefixLn)
        while (abstracted.length > 0) {
            subterm = createAbstraction(subterm);
            delete boundMapping[abstracted.pop()]
        }
        return subterm;
    }
    //term is application
    else {
        var subterms = getTerms(repr, prefixLn)
        for (var i = 0; i < subterms.length; ++i) {
            var subdepth = currentDepth;
            if (i == 0) {
                subdepth += subterms.length - 1;
            } else {
                subdepth += subterms.length - i;
            }
            subterms[i] = parseTerm(subterms[i][0], boundMapping, freeMapping, subdepth, subterms[i][1] + prefixLn)
        }
        subterms = subterms.reverse()
        while (subterms.length > 1) {
            var term1 = subterms.pop();
            var term2 = subterms.pop();
            subterms.push(createApplication(term1, term2))
        }
        return subterms[0];
    }
    throw new IllFormedEroor(repr.length + prefixLn)
}
//Separates string representation of series of applications to individual terms as pairs (term, position)
function getTerms(repr, prefixLn) {
    result = [];
    var prev = 0;
    var depth = 0;
    var trailingLambda = false;
    for (var i = 0; i < repr.length; ++i) {
        if (depth < 0) {
            throw new IllFormedEroor(i + prefixLn);
        }
        if (repr[i] == '(') {
            if (depth != Infinity) {
                prev = i + 1;
            }
            ++depth;
        } else if (repr[i] == ')') {
            --depth;
            if (depth == 0) {
                result.push([repr.substring(prev, i), prev]);
                prev = i + 1;
            }
        } else if (repr[i] == lambda) {
            if (depth == 0) {
                trailingLambda = true
                prev = i
                depth = Infinity
            }
        } else {
            if (depth == 0) {
                result.push([repr.substring(prev, i + 1), prev]);
                prev = i + 1;
            }
        }
    }
    if (trailingLambda) {
        result.push([repr.substring(prev), prev]);
        depth = 0;
    }
    if (depth > 0) {
        throw new IllFormedEroor(repr.length + prefixLn);
    }
    return result;
}

var letterCheckRegExp = new RegExp(/^\p{L}$/u)
function findNextChar(codeObj) {
    var result;
    do {
        ++codeObj.code
        result = String.fromCharCode(codeObj.code);
    } while (!letterCheckRegExp.test(result))
    return result;
}
function getRepr(term) {
    return getRepr_(term, 0, {}, [], [], { code: 0});
}
function getRepr_(term, currentDepth, freeVariables, boundVariables, boundPool, codeObj) {
    if (isBound(term)) {
        return boundVariables[currentDepth - term.depth];
    } else if (isFree(term)) {
        if (!(term.id in freeVariables)) {
            freeVariables[term.id] = findNextChar(codeObj);
        }
        return freeVariables[term.id];
    } else if (isAbstraction(term)) {
        if (boundPool.length > 0) {
            boundVariables[currentDepth] = boundPool.pop();
        } else {
            boundVariables[currentDepth] = findNextChar(codeObj);
        }
        ans = "(" + lambda + boundVariables[currentDepth] + ".";
        ans += getRepr_(term.term, currentDepth + 1, freeVariables, boundVariables, boundPool, codeObj) + ")";
        boundPool.push(boundVariables[currentDepth]);
        return ans;
    } else if (isApplication(term)) {
        return  "("
            + getRepr_(term.term1, currentDepth + 1, freeVariables, boundVariables, boundPool, codeObj)
            + getRepr_(term.term2, currentDepth + 1, freeVariables, boundVariables, boundPool, codeObj)
            + ")";
    }
}