const puppeteer = require('puppeteer');
const fs = require('fs');

function generateCookies(cookie) {
  const getCookieValueByKey = key => cookie.match(new RegExp(`${key}=(.*);Domain`))[1]

  const str = JSON.stringify(
    [
      { key: 'SID', value: getCookieValueByKey('SID'), domain: 'google.com' },
      { key: 'HSID', value: getCookieValueByKey('HSID'), domain: 'google.com' },
      { key: 'SSID', value: getCookieValueByKey('SSID'), domain: 'google.com' },
    ]
  );
  console.log('sukces!')
  return new Buffer(str).toString('base64');
}

const getCookies = async (username, password) => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 5000
  })
  try {
    const page = await browser.newPage();

    const a = await page.goto('https://accounts.google.com/ServiceLogin');

    //identifierId
    await page.waitForSelector('#Email', { timeout: 5000 })
    let elementHandle = await page.$('#Email');

    console.log('typing username...');
    await elementHandle.type(username);
    console.log('pressing enter...');
    await elementHandle.press('Enter');
    console.log('waiting for password input');
    await page.waitForSelector('input[type=password]:focus', { timeout: 5000 })
    elementHandle = await page.$('input[type=password]');
    console.log('typing password...');
    await elementHandle.type(password);
    await elementHandle.press('Enter');
    console.log('pressing enter...');
    const challenge = await page.waitForResponse(response => response.url().includes('challenge'))
    await browser.close();
    return generateCookies(challenge.headers()['set-cookie'])
  } catch (e) {
    console.log(e)
    await browser.close();
    return null;
  }
}

let [, , username, pswd] = process.argv;

//pswd = ''

console.log(`username: '${username}', pswd: '${pswd}'`)

  ; (async () => {
    try {
      await getCookies(username, pswd)
    } catch (e) {
      console.log(e)
    }
  })()



module.exports = {
  getCookies
}