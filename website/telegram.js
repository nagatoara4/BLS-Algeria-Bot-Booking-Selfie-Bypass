function buildTelegramMessage(bookingData, lang) {
  const isFr = lang === 'fr';
  const header = isFr ? '🆕 Nouvelle demande BLS Algérie' : '🆕 طلب جديد BLS الجزائر';
  const tg = bookingData.telegramUsername || (isFr ? 'non fourni' : 'غير مُدخل');

  return [
    header,
    '',
    `👤 ${isFr ? 'Nom' : 'الاسم'}: ${bookingData.lastName} ${bookingData.firstName}`,
    `📅 ${isFr ? 'Naissance' : 'تاريخ الميلاد'}: ${bookingData.dateOfBirth}`,
    `🛂 ${isFr ? 'Passeport' : 'جواز السفر'}: ${bookingData.passportNumber}`,
    `📍 ${isFr ? 'Lieu' : 'مكان الإصدار'}: ${bookingData.passportIssuePlace}`,
    `📅 ${isFr ? 'Expiration' : 'انتهاء الجواز'}: ${bookingData.passportExpiryDate}`,
    `📱 Telegram: ${tg}`,
    `🕐 ${new Date().toLocaleString()}`,
    '',
    isFr ? '✅ Script généré — installer Tampermonkey.' : '✅ تم إنشاء السكربت — ثبّت Tampermonkey.',
  ].join('\n');
}

async function notifyTelegram(bookingData, lang) {
  const cfg = window.BLS_CONFIG || {};
  const token = cfg.telegramBotToken;
  const chatId = cfg.telegramChatId;

  if (!token || !chatId) {
    return { ok: false, reason: 'not_configured' };
  }

  const text = buildTelegramMessage(bookingData, lang);
  const url =
    'https://api.telegram.org/bot' +
    encodeURIComponent(token) +
    '/sendMessage?chat_id=' +
    encodeURIComponent(chatId) +
    '&text=' +
    encodeURIComponent(text);

  try {
    const response = await fetch(url, { method: 'GET', mode: 'no-cors' });
    return { ok: true };
  } catch (error) {
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
        setTimeout(resolve, 1500);
      });
      return { ok: true };
    } catch (fallbackError) {
      return { ok: false, reason: fallbackError.message };
    }
  }
}
