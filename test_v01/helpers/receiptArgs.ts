export const getReceiptArgs = (receipt: any) => {
  return receipt.logs.find((log: any) => log?.args).args
}
