const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('1-Min Multi-API Bot is Active!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

const TOKEN = "8263789071:AAH7mIREsrLcXBJ5kxPL8bQ0LqjhNR_zcPk";
const bot = new TelegramBot(TOKEN, { polling: true });

const CHANNELS_CONFIG = [
  { id: "@avtomess", coin: "bitcoin", symbol: "₿ BTC" },
  { id: "@avtomess", coin: "ethereum", symbol: "⟠ ETH" },
  { id: "@avtomess", coin: "solana", symbol: "◎ SOL" },
  { id: "@avtomess", coin: "the-open-network", symbol: "💎 TON" },
  { id: "@avtomess", coin: "binancecoin", symbol: "🔶 BNB" },
  { id: "@avtomess", coin: "ripple", symbol: "✖️ XRP" },
  { id: "@avtomess", coin: "cardano", symbol: "₳ ADA" },
  { id: "@avtomess", coin: "dogecoin", symbol: "🐕 DOGE" },
  { id: "@avtomess", coin: "tron", symbol: "💎 TRX" },
  { id: "@avtomess", coin: "avalanche-2", symbol: "🔺 AVAX" },
  { id: "@avtomess", coin: "polkadot", symbol: "🔘 DOT" },
  { id: "@avtomess", coin: "chainlink", symbol: "🔗 LINK" },
  { id: "@avtomess", coin: "near", symbol: "Ⓝ NEAR" },
  { id: "@avtomess", coin: "matic-network", symbol: "🟣 MATIC" },
  { id: "@avtomess", coin: "litecoin", symbol: "Ł LTC" },
  { id: "@avtomess", coin: "uniswap", symbol: "🦄 UNI" },
  { id: "@avtomess", coin: "stellar", symbol: "🚀 XLM" },
  { id: "@avtomess", coin: "monero", symbol: "🔒 XMR" },
  { id: "@avtomess", coin: "ethereum-classic", symbol: "⟠ ETC" },

  // --- AKSIYALAR ---
  { id: "@avtomess", coin: "apple-tokenized-stock-bittrex", symbol: "🍏 APPLE" },
  { id: "@avtomess", coin: "tesla-tokenized-stock-bittrex", symbol: "⚡ TESLA" },
  { id: "@avtomess", coin: "nvidia-tokenized-stock-bittrex", symbol: "🎮 NVIDIA" },
  { id: "@avtomess", coin: "amazon-tokenized-stock-bittrex", symbol: "📦 AMAZON" },
  { id: "@avtomess", coin: "microsoft-tokenized-stock-bittrex", symbol: "💻 MSFT" },
  { id: "@avtomess", coin: "google-tokenized-stock-bittrex", symbol: "🔍 GOOGLE" },
  { id: "@avtomess", coin: "meta-platforms-tokenized-stock-bittrex", symbol: "♾️ META" },
  { id: "@avtomess", coin: "netflix-tokenized-stock-bittrex", symbol: "🎬 NETFLIX" },
  { id: "@avtomess", coin: "alibaba-tokenized-stock-bittrex", symbol: "🏮 ALIBABA" },
  { id: "@avtomess", coin: "coinbase-global-tokenized-stock-bittrex", symbol: "🏦 COINBASE" },
  { id: "@avtomess", coin: "oil-tokenized-stock-bittrex", symbol: "🛢 NEFT (Oil)" },

  // --- METALLAR ---
  { id: "@avtomess", coin: "pax-gold", symbol: "🟡 OLTIN" },
  { id: "@avtomess", coin: "tether-silver", symbol: "⚪ KUMUSH" },

  // --- TON & MEMS ---
  { id: "@avtomess", coin: "notcoin", symbol: "🔳 NOT" },
  { id: "@avtomess", coin: "hamster-kombat", symbol: "🐹 HMSTR" },
  { id: "@avtomess", coin: "dogs", symbol: "🦴 DOGS" },
  { id: "@avtomess", coin: "pepe", symbol: "🐸 PEPE" },
  { id: "@avtomess", coin: "shiba-inu", symbol: "🐕 SHIB" },
  { id: "@avtomess", coin: "bonk", symbol: "🦴 BONK" },
  { id: "@avtomess", coin: "floki", symbol: "⚔️ FLOKI" },
  { id: "@avtomess", coin: "dogwifhat", symbol: "👒 WIF" },
  { id: "@avtomess", coin: "catizen", symbol: "🐈 CATI" },

  // --- L1 & L2 ---
  { id: "@avtomess", coin: "aptos", symbol: "🪐 APT" },
  { id: "@avtomess", coin: "sui", symbol: "💧 SUI" },
  { id: "@avtomess", coin: "optimism", symbol: "🔴 OP" },
  { id: "@avtomess", coin: "sei-network", symbol: "🚢 SEI" },
  { id: "@avtomess", coin: "cosmos", symbol: "⚛️ ATOM" },
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
        console.log("⚠️ CoinGecko band, CoinCap-dan olinmoqda...");
      }

      for (const item of chunk) {
        try {
          let price, change;
          
          if (data[item.coin]) {
            price = data[item.coin].usd;
            change = data[item.coin].usd_24h_change;
          } else {
            // 2-urinish: Zaxira API (CoinCap) har bir koin uchun
            let ccId = item.coin === "the-open-network" ? "ton" : item.coin;
            const res = await axios.get(`https://api.coincap.io/v2/assets/${ccId}`, { timeout: 5000 }).catch(() => null);
            if (res && res.data.data) {
              price = parseFloat(res.data.data.priceUsd).toFixed(2);
              change = parseFloat(res.data.data.changePercent24Hr);
            }
          }

          if (price !== undefined) {
            const icon = change >= 0 ? "📈 +" : "📉 ";
            const text = `${item.symbol}: $${price} (${icon}${parseFloat(change).toFixed(2)}%)`;
            await bot.sendMessage(item.id, text).catch(() => null);
          }
          await sleep(900); // 1 minutga sig'ish uchun tezlashtirildi
        } catch (itemErr) {
          continue;
        }
      }
      await sleep(1000); 
    }
  } catch (err) {
    console.error("Xato:", err.message);
  }
}

// 1 daqiqada bir marta yangilash
setInterval(sendPrices, 60000);
sendPrices();
