
import * as s from "selenium-webdriver"
import {Options} from "selenium-webdriver/chrome.js";

function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 
async function refreshPage(driver: s.WebDriver) {
    let timeout = 6000;
    await driver.navigate().refresh();
    await driver.wait(s.until.elementLocated(s.By.css('body')), timeout);
    await driver.wait(async () => {
        const domContentLoaded = await driver.executeScript("return document.readyState === 'interactive' || document.readyState === 'complete'");
        return domContentLoaded;
    }, timeout);

    await driver.wait(async () => {
        const loadEvent = await driver.executeScript("return window.performance.timing.loadEventEnd > 0");
        return loadEvent;
    }, timeout);
}
async function closeOthers(driver:s.ThenableWebDriver | s.WebDriver,tab:string) {
    const allHandles = await driver.getAllWindowHandles();
    for (const handle of allHandles) {
        if (handle !== tab) {
            await driver.switchTo().window(handle);
            await driver.close();
        }
    }
    await driver.switchTo().window(tab);
}

let url = "https://s.deblok.me/adf.html"
const options = new Options();
// ensure a new browsing session is created
options.addArguments("--incognito","--disable-dev-shm-usage","--no-sandbox","disk-cache-size=0","--proxy-server=http://209.126.6.159:80")
let driver = await new s.Builder().forBrowser(s.Browser.CHROME).setChromeOptions(options).build()

async function clickPopunders(driver:s.ThenableWebDriver | s.WebDriver) {
    driver.executeScript(`
    let pu = document.querySelectorAll("div[style*=\\"z-index: 2147483647;\\"][style*=\\"position: fixed;\\"]")
    for (let i = 0; i < pu.length; i++) {
        pu[i].remove()
    }
`);
}

try {
    await driver.get("about:blank");
    driver.manage().deleteAllCookies();
    const tab = await driver.getWindowHandle();
    
    await driver.get(url);
    await timeout(3500);
    await clickPopunders(driver);
    const ads = await driver.findElements(s.By.css('iframe[width="728"], iframe[width="468"], iframe[width="300"], iframe[width="320"], iframe[width="160"]'));
    console.log(`Found ${ads.length} ads! Clicking...`)
    for (const ad of ads) {
        
        await driver.switchTo().frame(ad);
        const link = await driver.findElement(s.By.tagName('a'));
        try {
        await link.click();
        await timeout(800);
        await driver.switchTo().window(tab); 
        await timeout(200);
        } catch {
            // intercepted click
            console.log("Popunder intercepted click, getting rid of it...")
            await clickPopunders(driver);
        }
        //await driver.close();
        await timeout(1000);
    }
    await closeOthers(driver,tab)
    await driver.switchTo().window(tab);
} catch (error) {
    console.error("Error:", error);
} finally {
    // get impressions before exiting 
    console.log("Farming impressions...")
    for (let i = 0; i < 10; i++) {
    await refreshPage(driver)
    await timeout(1000);
    }
    console.log("Exiting!")
    await driver.quit();
}