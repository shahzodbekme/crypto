const express = require('express');
const app = express();

// Render portni avtomatik beradi, bo'lmasa 3000 ni oladi
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot ishlayapti...');
});

app.listen(PORT, () => {
  console.log(`Server port ${PORT} da yondi`);
});

// --- SIZNING BOT KODINGIZ SHU YERDAN DAVOM ETADI ---
// Masalan: bot.launch() yoki bot.startPolling()

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

const bot = new TelegramBot(TOKEN);

async function sendPrices(){

  try{

    const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

    const {data} = await axios.get(url,{timeout:10000});

    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;

    const btcChange = data.bitcoin.usd_24h_change.toFixed(2);
    const ethChange = data.ethereum.usd_24h_change.toFixed(2);
    const solChange = data.solana.usd_24h_change.toFixed(2);

    const btcIcon = btcChange >=0 ? "🟢" : "🔴";
    const ethIcon = ethChange >=0 ? "🟢" : "🔴";
    const solIcon = solChange >=0 ? "🟢" : "🔴";

    const message =
`📊 CRYPTO MARKET

₿ BTC: $${btc}
${btcIcon} 24h: ${btcChange}%

⟠ ETH: $${eth}
${ethIcon} 24h: ${ethChange}%

◎ SOL: $${sol}
${solIcon} 24h: ${solChange}%

⏱ ${new Date().toLocaleTimeString()}`;

    await bot.sendMessage(CHANNEL,message);

    console.log("Post yuborildi");

  }catch(err){

    console.log("API xato:",err.message);

  }

}

setInterval(sendPrices,60000);

console.log("Crypto bot ishga tushdi");
