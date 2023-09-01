export const getLogArgs = (logs: any): any[] => {
  return logs.find((log: any) => log.args)?.args || []
}
