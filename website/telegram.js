async function notifyTelegram(bookingData, lang) {
  const webhookUrl = window.BLS_CONFIG && window.BLS_CONFIG.n8nWebhookUrl;
  if (!webhookUrl || webhookUrl.includes('YOUR-N8N-INSTANCE')) {
    return { ok: false, reason: 'not_configured' };
  }

  const payload = {
    event: 'script_generated',
    lang: lang,
    timestamp: new Date().toISOString(),
    booking: {
      lastName: bookingData.lastName,
      firstName: bookingData.firstName,
      dateOfBirth: bookingData.dateOfBirth,
      passportNumber: bookingData.passportNumber,
      passportIssueDate: bookingData.passportIssueDate,
      passportExpiryDate: bookingData.passportExpiryDate,
      passportIssuePlace: bookingData.passportIssuePlace,
      franNumber: bookingData.franNumber,
      telegramUsername: bookingData.telegramUsername || '',
    },
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}
