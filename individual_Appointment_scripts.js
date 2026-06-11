// ==UserScript==
// @name         BLS Algeria Individual Appointment Auto-Book
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Auto-fill and submit BLS Algeria individual visa appointments when slots appear.
// @author       @Itsmaarouf
// @match        *://algeria.blsspainvisa.com/*
// @match        *://*.blsspainvisa.com/*
// @match        *://*.blsspainmorocco.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // EDIT YOUR PERSONAL DATA HERE
    // =========================================================================
    const CONFIG = {
        lastName: 'Last Name',
        firstName: 'First Name',
        dateOfBirth: 'yyyy-mm-dd',
        passportNumber: 'Passport Number',
        passportIssueDate: 'yyyy-mm-dd',
        passportExpiryDate: 'yyyy-mm-dd',
        passportIssuePlace: 'city name',
        franNumber: 'TG700******',
        visaTypeIndex: 1,
        passportTypeIndex: 7,
        reloadIntervalMs: 30 * 1000,
        submitIntervalMs: 10 * 1000,
        playAlertSound: true,
    };
    // =========================================================================

    const log = (msg) => console.log('[BLS Algeria Bot]', msg);

    function byId(id) {
        return document.getElementById(id);
    }

    function setValue(id, value) {
        const el = byId(id);
        if (el && value) {
            el.value = value;
        }
    }

    function setDatepicker(id, value) {
        if (!value || !byId(id)) {
            return;
        }
        try {
            $('#' + id).datepicker('update', value);
        } catch (err) {
            log('datepicker update failed for ' + id + ': ' + err.message);
        }
    }

    function findAvailableDatesCode() {
        for (let i = 0; i < document.scripts.length; i++) {
            const script = document.scripts[i];
            if (!script || !script.text) {
                continue;
            }
            if (script.text.indexOf('available_dates') !== -1) {
                return script.text;
            }
        }
        return '';
    }

    function parseFirstAvailableDate(code) {
        const start = code.indexOf('available_dates');
        const end = code.indexOf('fullCapicity_dates');
        if (start === -1 || end === -1 || end <= start) {
            return '';
        }

        const table = code.slice(start + 20, end - 9);
        if (!table) {
            return '';
        }

        const datee = table.slice(0, 10);
        const dd = datee.slice(0, 2);
        const mm = datee.slice(3, 5);
        const yyyy = datee.slice(6, 10);
        return [yyyy, mm, dd].join('-');
    }

    function playAlert() {
        if (!CONFIG.playAlertSound) {
            return;
        }
        try {
            const audio = new Audio(
                'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-the-sound-pack-tree/tspt_german_ambulance_sirens_wailing_loop_041.mp3'
            );
            audio.play().catch(() => log('Could not play alert sound (browser blocked autoplay).'));
        } catch (err) {
            log('Alert sound error: ' + err.message);
        }
    }

    function selectLastTimeSlot() {
        const timeSelect = byId('app_time');
        if (timeSelect && timeSelect.length > 1) {
            timeSelect.selectedIndex = timeSelect.length - 1;
        }
    }

    function fillPersonalDetails() {
        setValue('first_name', CONFIG.firstName);
        setValue('last_name', CONFIG.lastName);
        setDatepicker('dateOfBirth', CONFIG.dateOfBirth);
        setValue('passport_no', CONFIG.passportNumber);
        setDatepicker('pptIssueDate', CONFIG.passportIssueDate);
        setDatepicker('pptExpiryDate', CONFIG.passportExpiryDate);
        setValue('pptIssuePalace', CONFIG.passportIssuePlace);

        const visaType = byId('VisaTypeId');
        if (visaType) {
            visaType.selectedIndex = CONFIG.visaTypeIndex;
        }

        const fran = byId('fran');
        if (fran) {
            fran.value = CONFIG.franNumber;
        }

        const passportType = byId('passportType');
        if (passportType) {
            passportType.selectedIndex = CONFIG.passportTypeIndex;
        }

        const vasId12 = byId('vasId12');
        if (vasId12) {
            $('#vasId12').prop('checked', true);
        }

        selectLastTimeSlot();
        playAlert();
        log('Personal details filled.');
    }

    function isFormReadyForSubmit() {
        const required = [
            'app_date',
            'app_time',
            'VisaTypeId',
            'first_name',
            'last_name',
            'dateOfBirth',
            'passport_no',
            'pptIssueDate',
            'pptExpiryDate',
            'pptIssuePalace',
        ];

        for (const id of required) {
            const el = byId(id);
            if (!el || !String(el.value || '').trim()) {
                return false;
            }
        }

        const passportType = byId('passportType');
        if (passportType && !String(passportType.value || '').trim()) {
            return false;
        }

        return true;
    }

    function clickSubmit() {
        if (!isFormReadyForSubmit()) {
            return;
        }

        const submitBtn = document.getElementsByClassName('btn primary-btn')[0];
        if (!submitBtn) {
            log('Submit button not found.');
            return;
        }

        log('Clicking submit...');
        submitBtn.click();
    }

    function scheduleReloadIfNoDate() {
        const appDate = byId('app_date');
        if (appDate && !appDate.value) {
            setTimeout(() => window.location.reload(), CONFIG.reloadIntervalMs);
        }
    }

    function bindSubmitStopper(submitIntervalId) {
        const submitBtn = document.getElementsByClassName('btn primary-btn')[0];
        if (!submitBtn) {
            return;
        }

        submitBtn.addEventListener('click', () => {
            log('Manual submit detected — stopping auto-submit.');
            clearInterval(submitIntervalId);
        });
    }

    function run() {
        const code = findAvailableDatesCode();
        if (!code) {
            log('No available_dates script found on page yet.');
            scheduleReloadIfNoDate();
            return;
        }

        const finDate = parseFirstAvailableDate(code);
        const appDate = byId('app_date');

        if (!appDate) {
            log('Appointment date field not found on this page.');
            return;
        }

        if (!appDate.value && finDate) {
            setDatepicker('app_date', finDate);
            log('Selected available date: ' + finDate);
        } else if (appDate.value) {
            fillPersonalDetails();
        }

        scheduleReloadIfNoDate();

        const submitIntervalId = setInterval(clickSubmit, CONFIG.submitIntervalMs);
        bindSubmitStopper(submitIntervalId);

        log('Bot running.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
