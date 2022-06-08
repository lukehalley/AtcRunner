export async function poll(fn: Function, whileCondition: (result: any) => boolean, ms?: number) {
  let result = await fn()
  while (whileCondition(result)) {
    await wait(ms)
    result = await fn()
  }
  return result
}

function wait(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}
