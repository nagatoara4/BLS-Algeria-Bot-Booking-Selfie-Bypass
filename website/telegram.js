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

function ensureTelegramFrame() {
  let iframe = document.getElementById('tg-notify-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'tg-notify-frame';
    iframe.name = 'tg-notify-frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'display:none;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
  }
  return iframe;
}

function sendViaHiddenForm(token, chatId, text) {
  ensureTelegramFrame();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://api.telegram.org/bot' + token + '/sendMessage';
  form.target = 'tg-notify-frame';
  form.style.display = 'none';
  form.acceptCharset = 'UTF-8';

  const chatField = document.createElement('input');
  chatField.type = 'hidden';
  chatField.name = 'chat_id';
  chatField.value = chatId;
  form.appendChild(chatField);

  const textField = document.createElement('input');
  textField.type = 'hidden';
  textField.name = 'text';
  textField.value = text;
  form.appendChild(textField);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function sendViaImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
    setTimeout(resolve, 2000);
  });
}

async function notifyTelegram(bookingData, lang) {
  const cfg = window.BLS_CONFIG || {};
  const token = cfg.telegramBotToken;
  const chatId = cfg.telegramChatId;

  if (!token || !chatId) {
    return { ok: false, reason: 'not_configured' };
  }

  const text = buildTelegramMessage(bookingData, lang);

  try {
    // Works from file:// — form POST does not need CORS
    sendViaHiddenForm(token, chatId, text);
    return { ok: true, method: 'form' };
  } catch (formError) {
    const url =
      'https://api.telegram.org/bot' +
      token +
      '/sendMessage?chat_id=' +
      encodeURIComponent(chatId) +
      '&text=' +
      encodeURIComponent(text);

    try {
      await sendViaImage(url);
      return { ok: true, method: 'image' };
    } catch (imageError) {
      return { ok: false, reason: imageError.message || formError.message };
    }
  }
}
