// @ts-ignore — midtrans-client tidak punya official types
const midtransClient = require('midtrans-client')

export const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})
