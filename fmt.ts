export function liqFmt(liq: number) {
  return `${Math.floor(liq / 1000)}k`
}

export function routeFmt(liq) {
  return `${Math.floor(liq / 1000)}k`
}
