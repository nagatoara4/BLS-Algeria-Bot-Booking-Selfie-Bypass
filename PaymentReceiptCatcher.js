// ==UserScript==
// @name         BLS Payment Receipt Catcher
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Auto-print payment receipt and copy payment link to clipboard.
// @author       Itsmaarouf
// @match        https://payment.cmi.co.ma/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const log = (msg) => console.log('[BLS Payment]', msg);

    function printReceiptIfAvailable() {
        if ($('#print').length === 1) {
            window.print();
            log('Print dialog opened for payment receipt.');
        }
    }

    function copyPaymentLink() {
        const tokenInput = document.querySelector('input[name=paymentLinkToken]');
        if (!tokenInput || !tokenInput.value) {
            log('Payment token not found on this page.');
            return;
        }

        const paymentUrl = 'https://payment.cmi.co.ma/fim/paymentLinkService?token=' + tokenInput.value;
        log('Payment URL: ' + paymentUrl);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(paymentUrl).then(
                () => log('Payment link copied to clipboard.'),
                (err) => log('Clipboard copy failed: ' + err)
            );
        } else {
            log('Clipboard API not available in this browser context.');
        }
    }

    function run() {
        printReceiptIfAvailable();
        copyPaymentLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
