const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('requestfailed', request =>
    console.error('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log("Navigating to dashboard...");
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  
  const content = await page.content();
  console.log("\n--- HTML CONTENT ---");
  console.log(content);
  
  await browser.close();
})();
