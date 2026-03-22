for (const item of chunk) {
        try {
          let price, change;
          
          if (data[item.coin]) {
            price = data[item.coin].usd;
            change = data[item.coin].usd_24h_change;
          } else {
            // 2-urinish: Zaxira API (CoinCap) har bir koin uchun
            let ccId = item.coin === "the-open-network" ? "ton" : item.coin;
            const res = await axios.get(https://api.coincap.io/v2/assets/${ccId}, { timeout: 5000 }).catch(() => null);
            if (res && res.data.data) {
              price = parseFloat(res.data.data.priceUsd).toFixed(2);
              change = parseFloat(res.data.data.changePercent24Hr);
            }
          }

          if (price !== undefined) {
            const icon = change >= 0 ? "📈 +" : "📉 ";
            const text = ${item.symbol}: $${price} (${icon}${parseFloat(change).toFixed(2)}%);
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
setInterval(sendPrices, 180000);
sendPrices();
// 6. VAQTNI HISOBLASH FUNKSIYASI
function calculateRemaining(birthdayStr) {
    const [d, m, y] = birthdayStr.split('.').map(Number);
    const now = new Date();
    
    // Toshkent vaqti bilan solishtirish (UTC+5)
    let nextBday = new Date(now.getFullYear(), m - 1, d);
    
    // Agar bu yilgi tug'ilgan kun o'tib ketgan bo'lsa, kelasi yilnikini olamiz
    if (nextBday < now) {
        nextBday.setFullYear(now.getFullYear() + 1);
    }

    const diff = nextBday - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { days };
}

// 7. HAR KUNI SOAT 09:00 DA AVTOMATIK XABAR (Cron Job)
cron.schedule("0 9 * * *", () => {
    console.log("Eslatmalar yuborish boshlandi...");
    
    for (const userId in users) {
        const user = users[userId];
        const info = calculateRemaining(user.date);
        
        let message = `🔔 Eslatma: Tug'ilgan kuningizga **${info.days} kun** qoldi!`;
        
        // Agar aynan bugun bo'lsa
        if (info.days === 0 || info.days === 366) {
            message = `🥳 BUGUN SIZNING TUG'ILGAN KUNINGIZ! \n\n${user.name}, tabriklaymiz! Umringiz uzoq bo'lsin! 🎂🎉`;
        }

        bot.api.sendMessage(user.chatId, message, { parse_mode: "Markdown" })
            .catch(err => console.error(`Xabar ketmadi (${user.name}):`, err.message));
    }
}, {
    timezone: "Asia/Tashkent"
});

// 8. BOTNI ISHGA TUSHIRISH
bot.start({
    onStart: () => console.log("🚀 Tug'ilgan kun boti muvaffaqiyatli ishga tushdi!")
});
