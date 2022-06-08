import { NumericOperators, RangeValue, YesOrNo } from './types'

function convertToJewelPrice(price: number) {
  return price * Math.pow(10, 18)
}

export function generateParam<T>(field: string, operator: string, value: T) {
  if (value != undefined) {
    return {
      field,
      operator,
      value
    }
  }
  return undefined
}

export function generateArrayParam(field: string, value?: string[] | number[]) {
  return generateParam(field, 'in', value)
}

export function generateNumericOperationParam(field: string, operator: NumericOperators, value?: number) {
  return generateParam(field, operator, value)
}

export function generateMinMaxParam(field: string, values?: RangeValue, min = 0, max = 9999, isPrice?: boolean) {
  if (values) {
    return values.map((v, i) => {
      const isMinDefault = i === 0 && v === min
      const isMaxDefault = i === 1 && v === max
      if (isMinDefault || isMaxDefault) return undefined
      return generateParam(field, i === 0 ? '>=' : '<=', isPrice ? convertToJewelPrice(v) : v)
    })
  }
  return []
}

export function generateStringEqualityParam(field: string, value?: string) {
  return generateParam(field, '=', value)
}

export function generateBooleanParam(field: string, value?: YesOrNo | boolean) {
  return generateParam(field, '=', typeof value === 'string' ? yesOrNoToBoolean(value) : value)
}

function yesOrNoToBoolean(value: YesOrNo) {
  return {
    yes: true,
    no: false
  }[value]
}
