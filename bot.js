const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('1-Min Multi-API Bot is Active!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

// DIQQAT: Tokeningizni xavfsiz joyda saqlang (process.env tavsiya etiladi)
const TOKEN = "8263789071:AAH7mIREsrLcXBJ5kxPL8bQ0LqjhNR_zcPk";
const bot = new TelegramBot(TOKEN, { polling: true });

const CHANNELS_CONFIG = [
  { id: "@avtomess", coin: "bitcoin", symbol: "₿ BTC" },
  { id: "@ethereum_ethprice", coin: "ethereum", symbol: "⟠ ETH" },
  { id: "@solana_sol_pricee", coin: "solana", symbol: "◎ SOL" },
  { id: "@ton_price_toncoin", coin: "the-open-network", symbol: "💎 TON" },
  { id: "@bnb_pricee", coin: "binancecoin", symbol: "🔶 BNB" },
  { id: "@xrp_ripple_price", coin: "ripple", symbol: "✖️ XRP" },
  { id: "@ada_pricee", coin: "cardano", symbol: "₳ ADA" },
  { id: "@doge_pricee", coin: "dogecoin", symbol: "🐕 DOGE" },
  { id: "@trx_price_tron", coin: "tron", symbol: "💎 TRX" },
  { id: "@avax_pricee", coin: "avalanche-2", symbol: "🔺 AVAX" },
  { id: "@dot_pricee", coin: "polkadot", symbol: "🔘 DOT" },
  { id: "@link_pricee", coin: "chainlink", symbol: "🔗 LINK" },
  { id: "@near_pricee", coin: "near", symbol: "Ⓝ NEAR" },
  { id: "@matic_prices", coin: "matic-network", symbol: "🟣 MATIC" },
  { id: "@litecoin_ltc_price", coin: "litecoin", symbol: "Ł LTC" },
  { id: "@uniuniswap", coin: "uniswap", symbol: "🦄 UNI" },

  // --- AKSIYALAR ---
  { id: "@avtomess", coin: "apple", symbol: "🍏 APPLE" }, // CoinCap uchun soddalashtirildi
  { id: "@avtomess", coin: "tesla", symbol: "⚡️ TESLA" },
  { id: "@avtomess", coin: "nvidia", symbol: "🎮 NVIDIA" },
  
  // --- TON & MEMS ---
  { id: "@avtomess", coin: "notcoin", symbol: "🔳 NOT" },
  { id: "@avtomess", coin: "hamster-kombat", symbol: "🐹 HMSTR" },
  { id: "@avtomess", coin: "dogs", symbol: "🦴 DOGS" },
  { id: "@avtomess", coin: "pepe", symbol: "🐸 PEPE" }
  // ... qolganlarini ham shu formatda davom ettiring
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendPrices() {
  try {
    const chunkSize = 46;
    for (let i = 0; i < CHANNELS_CONFIG.length; i += chunkSize) {
      const chunk = CHANNELS_CONFIG.slice(i, i + chunkSize);
      const coinIds = chunk.map(c => c.coin).join(',');
      
      let data = {};
      try {
        // 1-urinish: CoinGecko
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`, { timeout: 10000 });
        data = response.data;
      } catch (e) {
        console.log("⚠️ CoinGecko band, CoinCap-dan tekshiriladi...");
      }

      for (const item of chunk) {
        try {
          let price, change;
          
          if (data[item.coin]) {
            price = data[item.coin].usd;
            change = data[item.coin].usd_24h_change;
          } else {
            // 2-urinish: Zaxira API (CoinCap)
            let ccId = item.coin === "the-open-network" ? "ton" : item.coin;
            if (ccId === "binancecoin") ccId = "binance-coin"; // CoinCap farqi

            const res = await axios.get(`https://api.coincap.io/v2/assets/${ccId}`, { timeout: 5000 }).catch(() => null);
            if (res && res.data && res.data.data) {
              price = parseFloat(res.data.data.priceUsd);
              change = parseFloat(res.data.data.changePercent24Hr);
            }
          }

          if (price !== undefined && price !== null) {
            const icon = change >= 0 ? "📈 +" : "📉 ";
            // Narx formatini chiroyli qilish (kichik koinlar uchun 6 xona, kattalar uchun 2 xona)
            const formattedPrice = price < 1 ? price.toFixed(6) : price.toLocaleString('en-US', { minimumFractionDigits: 2 });
            const text = `${item.symbol}: $${formattedPrice} (${icon}${parseFloat(change).toFixed(2)}%)`;
            
            await bot.sendMessage(item.id, text).catch(() => null);
          }
          
          // Telegram 429 xatosini oldini olish uchun delay (kamida 1-2 soniya tavsiya etiladi)
          await sleep(1500); 
        } catch (itemErr) {
          console.error(`Xato (${item.symbol}):`, itemErr.message);
          continue;
        }
      }
      await sleep(2000); 
    }
  } catch (err) {
    console.error("Umumiy xato:", err.message);
  }
}

// Har 3 daqiqada yangilash (180000 ms)
setInterval(sendPrices, 180000);
// Birinchi marta darhol ishga tushirish
sendPrices();
