export function liqFmt(liq: number) {
  return `${Math.floor(liq / 1000)}k`
}

export function routeFmt(route) {
  let str = ""
  for (const hop of route) {
    str += `${str ? "" : hop.token1} =${liqFmt(hop.liq)}=> ${round(hop.price, 7)} ${hop.token2} `
  }
  return str
}

export function round(num: number, dec = 2) {
  return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec)
}
