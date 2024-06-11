function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
import * as s from "selenium-webdriver"
let driver = await new s.Builder().forBrowser(s.Browser.CHROME).build()
  try {
    await driver.get('https://www.google.com/ncr')
    await driver.findElement(s.By.name('q')).sendKeys('webdriver', s.Key.RETURN)
    await driver.wait(s.until.titleIs('webdriver - Google Search'), 1000)
    await timeout(1000)
  } finally {
    await driver.quit()
  }