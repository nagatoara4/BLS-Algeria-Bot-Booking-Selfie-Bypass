# bls_algeria_appointment_scripts

In this repository, I will upload all my scripts that I use to **book a BLS Algeria appointment automatically**.

---

## 💡 Why did I create this script?

- It's really hard to get an appointment at BLS centers these days, especially for Algeria 🇩🇿.  
- Appointments appear for a few seconds and disappear again for weeks.  
- Without an automation script, it's almost impossible to catch a free slot in time.  
- So I decided to make this public to help others who face the same issue. 😉

---

## 🌐 Website (easiest way)

**Live site:** https://nagatoara4.github.io/BLS-Algeria-Bot-Booking-Selfie-Bypass/

Or open `website/index.html` locally in your browser (double-click the file).

### Deploy / update the website

Pushes to `main` or `Selfie-Verify-AI-bypass` that change `website/` trigger GitHub Pages automatically.

**One-time setup (if the live link shows 404):**
1. Open repo **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run the **Deploy website to GitHub Pages** workflow from the Actions tab

1. Fill in your personal and passport details in Arabic.
2. Click **إنشاء سكربت الحجز التلقائي** — a `.user.js` file downloads automatically.
3. Install **Tampermonkey**, open the downloaded file, and save the script.
4. Go to [algeria.blsspainvisa.com](https://algeria.blsspainvisa.com/) and start an individual booking — the bot runs automatically on the booking page.

Your data stays on your device only. Nothing is sent to a server.

## ⚙️ Manual script setup (alternative)

1. Install the **Tampermonkey** extension in Chrome or Firefox.  
2. Open `individual_Appointment_scripts.js` from this repo.  
3. Edit the `CONFIG` section at the top with your real personal data (name, passport, dates, etc.).  
4. In Tampermonkey, click **Create a new script**, paste the code, and click **Save**.  
5. Go to [algeria.blsspainvisa.com](https://algeria.blsspainvisa.com/) and start the individual appointment booking flow.  
6. The script will:
   - detect available appointment dates on the page,
   - auto-select the first free date,
   - fill your form fields,
   - play an alert sound when a slot is found,
   - auto-click submit every 10 seconds until you submit manually.  
7. After payment, install `PaymentReceiptCatcher.js` the same way to auto-print the receipt and copy the payment link.

### Optional: Python simulator

```bash
pip install -r requirements.txt
python BLS.py generate --count 200
python BLS.py simulate-check
python BLS.py attempt-book --attempts 5
```

---

## 📝 Notes / Disclaimer

- Use these scripts at your own risk. Automating interactions with websites can violate terms of service.  
- I am not responsible for any misuse or consequences resulting from use of these scripts.  
- These scripts are provided to help people who legitimately struggle to find appointment slots.

---

## 📱 Developer Contact

If you need support or have questions, contact the developer on WhatsApp:  
**Developer WhatsApp:** https://wa.me/201029107547

---
