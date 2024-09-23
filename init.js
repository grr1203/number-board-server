const puppeteer = require('puppeteer');

let browser = null;

async function startBrowser() {
  if (browser) await browser.close();

  const newBrowser = await puppeteer.launch({
    headless: false, // 실제 브라우저 띄우기
    defaultViewport: null, // 뷰포트 크기를 브라우저의 창 크기에 맞게 설정
    args: ['--start-maximized'], // 브라우저 최대화
    protocolTimeout: 0,
  });
  return newBrowser;
}

async function goNewPage(browser) {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1');
  await page.evaluate(() => document.documentElement.requestFullscreen());
  return page;
}

// main
(async () => {
  browser = await startBrowser();

  try {
    await goNewPage(browser);
    setInterval(async () => {
      const pages = await browser.pages();
      console.log('pages length', pages.length);

      // 페이지 닫힌 경우 자동 재시작
      if (pages.length < 2) {
        console.log('restart browser');
        browser = await startBrowser();
        await goNewPage(browser);
      }
    }, 5000);
  } catch (err) {
    console.error('browser error : ', err);
    if (browser) {
      console.log('browser closed');
      await browser.close();
    }
  }
})();
