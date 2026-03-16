const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

const bot = new TelegramBot(TOKEN);

async function sendPrices(){

  try{

    const {data} = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true"
    );

    const message =
`📊 CRYPTO MARKET

BTC: $${data.bitcoin.usd}
ETH: $${data.ethereum.usd}
SOL: $${data.solana.usd}

⏱ ${new Date().toLocaleTimeString()}`;

    await bot.sendMessage(CHANNEL,message);

    console.log("Post yuborildi");

  }catch(err){

    console.log("API xato:",err.message);

  }

}

sendPrices();
setInterval(sendPrices,60000);

console.log("Bot ishga tushdi");
