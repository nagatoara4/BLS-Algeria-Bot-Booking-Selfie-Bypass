const STORAGE_KEY = 'bls_algeria_booking_form_v2';
const LANG_KEY = 'bls_algeria_lang';

let currentLang = localStorage.getItem(LANG_KEY) || 'ar';

function t(key) {
  return (window.BLS_I18N[currentLang] && window.BLS_I18N[currentLang][key]) || key;
}

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function showAlert(message, type) {
  const el = document.getElementById('form-alert');
  el.textContent = message;
  el.className = 'alert show ' + type;
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  const dict = window.BLS_I18N[lang];
  document.documentElement.lang = dict.lang;
  document.documentElement.dir = dict.dir;
  document.title = dict.title;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });

  const yesOpt = document.querySelector('#playAlertSound option[value="true"]');
  const noOpt = document.querySelector('#playAlertSound option[value="false"]');
  if (yesOpt) yesOpt.textContent = dict.yes;
  if (noOpt) noOpt.textContent = dict.no;

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function getFormData(form) {
  const data = new FormData(form);
  return {
    lastName: data.get('lastName').trim(),
    firstName: data.get('firstName').trim(),
    dateOfBirth: data.get('dateOfBirth'),
    passportNumber: data.get('passportNumber').trim(),
    passportIssueDate: data.get('passportIssueDate'),
    passportExpiryDate: data.get('passportExpiryDate'),
    passportIssuePlace: data.get('passportIssuePlace').trim(),
    franNumber: data.get('franNumber').trim() || 'TG700******',
    telegramUsername: data.get('telegramUsername').trim(),
    visaTypeIndex: Number(data.get('visaTypeIndex')) || 1,
    passportTypeIndex: Number(data.get('passportTypeIndex')) || 7,
    reloadIntervalMs: (Number(data.get('reloadIntervalSec')) || 30) * 1000,
    submitIntervalMs: (Number(data.get('submitIntervalSec')) || 10) * 1000,
    playAlertSound: data.get('playAlertSound') === 'true',
  };
}

function validateForm(data) {
  const required = [
    'lastName', 'firstName', 'dateOfBirth', 'passportNumber',
    'passportIssueDate', 'passportExpiryDate', 'passportIssuePlace',
  ];
  for (const key of required) {
    if (!data[key]) return t('errRequired');
  }
  if (data.passportExpiryDate <= data.passportIssueDate) {
    return t('errExpiry');
  }
  return '';
}

function buildUserscript(config) {
  const c = config;
  return `// ==UserScript==
// @name         BLS Algeria Auto-Book - ${escapeJsString(c.firstName)} ${escapeJsString(c.lastName)}
// @namespace    bls-algeria-free-helper
// @version      1.3
// @description  Auto booking helper generated locally
// @match        *://algeria.blsspainvisa.com/*
// @match        *://*.blsspainvisa.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';
    const CONFIG = {
        lastName: '${escapeJsString(c.lastName)}',
        firstName: '${escapeJsString(c.firstName)}',
        dateOfBirth: '${escapeJsString(c.dateOfBirth)}',
        passportNumber: '${escapeJsString(c.passportNumber)}',
        passportIssueDate: '${escapeJsString(c.passportIssueDate)}',
        passportExpiryDate: '${escapeJsString(c.passportExpiryDate)}',
        passportIssuePlace: '${escapeJsString(c.passportIssuePlace)}',
        franNumber: '${escapeJsString(c.franNumber)}',
        visaTypeIndex: ${c.visaTypeIndex},
        passportTypeIndex: ${c.passportTypeIndex},
        reloadIntervalMs: ${c.reloadIntervalMs},
        submitIntervalMs: ${c.submitIntervalMs},
        playAlertSound: ${c.playAlertSound},
    };
    const log = (msg) => console.log('[BLS Algeria Bot]', msg);
    function byId(id) { return document.getElementById(id); }
    function setValue(id, value) { const el = byId(id); if (el && value) el.value = value; }
    function setDatepicker(id, value) {
        if (!value || !byId(id)) return;
        try { $('#' + id).datepicker('update', value); } catch (e) { log(e.message); }
    }
    function findAvailableDatesCode() {
        for (let i = 0; i < document.scripts.length; i++) {
            const script = document.scripts[i];
            if (script && script.text && script.text.indexOf('available_dates') !== -1) return script.text;
        }
        return '';
    }
    function parseFirstAvailableDate(code) {
        const start = code.indexOf('available_dates');
        const end = code.indexOf('fullCapicity_dates');
        if (start === -1 || end === -1 || end <= start) return '';
        const table = code.slice(start + 20, end - 9);
        if (!table) return '';
        const datee = table.slice(0, 10);
        return [datee.slice(6, 10), datee.slice(3, 5), datee.slice(0, 2)].join('-');
    }
    function playAlert() {
        if (!CONFIG.playAlertSound) return;
        new Audio('https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-the-sound-pack-tree/tspt_german_ambulance_sirens_wailing_loop_041.mp3')
            .play().catch(() => log('Sound blocked'));
    }
    function fillPersonalDetails() {
        setValue('first_name', CONFIG.firstName);
        setValue('last_name', CONFIG.lastName);
        setDatepicker('dateOfBirth', CONFIG.dateOfBirth);
        setValue('passport_no', CONFIG.passportNumber);
        setDatepicker('pptIssueDate', CONFIG.passportIssueDate);
        setDatepicker('pptExpiryDate', CONFIG.passportExpiryDate);
        setValue('pptIssuePalace', CONFIG.passportIssuePlace);
        const visaType = byId('VisaTypeId'); if (visaType) visaType.selectedIndex = CONFIG.visaTypeIndex;
        const fran = byId('fran'); if (fran) fran.value = CONFIG.franNumber;
        const passportType = byId('passportType'); if (passportType) passportType.selectedIndex = CONFIG.passportTypeIndex;
        const vasId12 = byId('vasId12'); if (vasId12) $('#vasId12').prop('checked', true);
        const timeSelect = byId('app_time'); if (timeSelect && timeSelect.length > 1) timeSelect.selectedIndex = timeSelect.length - 1;
        playAlert();
        log('Details filled.');
    }
    function isFormReadyForSubmit() {
        const required = ['app_date','app_time','VisaTypeId','first_name','last_name','dateOfBirth','passport_no','pptIssueDate','pptExpiryDate','pptIssuePalace'];
        for (const id of required) { const el = byId(id); if (!el || !String(el.value || '').trim()) return false; }
        const passportType = byId('passportType');
        if (passportType && !String(passportType.value || '').trim()) return false;
        return true;
    }
    function clickSubmit() {
        if (!isFormReadyForSubmit()) return;
        const submitBtn = document.getElementsByClassName('btn primary-btn')[0];
        if (!submitBtn) return;
        log('Submitting...');
        submitBtn.click();
    }
    function scheduleReloadIfNoDate() {
        const appDate = byId('app_date');
        if (appDate && !appDate.value) setTimeout(() => window.location.reload(), CONFIG.reloadIntervalMs);
    }
    function run() {
        const code = findAvailableDatesCode();
        if (!code) { log('Waiting for slots...'); scheduleReloadIfNoDate(); return; }
        const finDate = parseFirstAvailableDate(code);
        const appDate = byId('app_date');
        if (!appDate) return;
        if (!appDate.value && finDate) { setDatepicker('app_date', finDate); log('Date selected: ' + finDate); }
        else if (appDate.value) { fillPersonalDetails(); }
        scheduleReloadIfNoDate();
        const submitIntervalId = setInterval(clickSubmit, CONFIG.submitIntervalMs);
        const submitBtn = document.getElementsByClassName('btn primary-btn')[0];
        if (submitBtn) submitBtn.addEventListener('click', () => clearInterval(submitIntervalId));
        log('Bot running.');
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();`;
}

function downloadScript(content, filename) {
  const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function saveToLocal(form) {
  const data = getFormData(form);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  showAlert(t('successSave'), 'success');
}

function loadFromLocal(form) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    form.lastName.value = data.lastName || '';
    form.firstName.value = data.firstName || '';
    form.dateOfBirth.value = data.dateOfBirth || '';
    form.passportNumber.value = data.passportNumber || '';
    form.passportIssueDate.value = data.passportIssueDate || '';
    form.passportExpiryDate.value = data.passportExpiryDate || '';
    form.passportIssuePlace.value = data.passportIssuePlace || '';
    form.franNumber.value = data.franNumber || '';
    form.telegramUsername.value = data.telegramUsername || '';
    form.visaTypeIndex.value = data.visaTypeIndex ?? 1;
    form.passportTypeIndex.value = data.passportTypeIndex ?? 7;
    form.reloadIntervalSec.value = (data.reloadIntervalMs || 30000) / 1000;
    form.submitIntervalSec.value = (data.submitIntervalMs || 10000) / 1000;
    form.playAlertSound.value = data.playAlertSound === false ? 'false' : 'true';
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });

  applyLanguage(currentLang);
  loadFromLocal(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = getFormData(form);
    const error = validateForm(data);
    if (error) {
      showAlert(error, 'error');
      return;
    }

    const script = buildUserscript(data);
    const filename = 'bls-algeria-booking-' + data.lastName.toLowerCase() + '.user.js';
    downloadScript(script, filename);
    saveToLocal(form);

    const telegramResult = await notifyTelegram(data, currentLang);
    let message = t('successGenerate');
    if (telegramResult.ok) {
      message += ' ' + t('successTelegram');
    } else if (telegramResult.reason === 'not_configured') {
      message += ' ' + t('warnTelegram');
    }
    showAlert(message, 'success');
  });

  document.getElementById('save-local').addEventListener('click', () => saveToLocal(form));
  document.getElementById('clear-local').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    showAlert(t('successClear'), 'success');
  });
});
