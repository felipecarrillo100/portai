import {numberParameter} from "@luciad/ria/util/expression/ExpressionFactory";

enum ExpressionFactoryTypes {
    ScaleExpression = "ScaleExpression"
}

class ExpressionFactory {
    createScaleExpression(scale: {value: number, range: { minimum: number, maximum: number}}) {
        const expression = {
            expression: () => {
                return expression.factorParameter;
            },
            factorParameter: numberParameter(scale.value),
            type: ExpressionFactoryTypes.ScaleExpression,
            update: (newFactor: number) => {
                if (scale.range.minimum<= newFactor && newFactor <= scale.range.maximum) {
                    expression.factorParameter.value = newFactor;
                    scale.value = newFactor;
                }
            }
        }
        return expression;
    }
}

export {
    ExpressionFactory
}