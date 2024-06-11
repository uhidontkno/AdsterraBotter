function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
import * as s from "selenium-webdriver"
let url = "https://s.deblok.me/adf.html"
let driver = await new s.Builder().forBrowser(s.Browser.CHROME).build()
async function clickPopunders(driver:s.ThenableWebDriver | s.WebDriver) {
    driver.executeScript(`
    let pu = document.querySelectorAll("div[style*=\\"z-index: 2147483647;\\"][style*=\\"position: fixed;\\"]")
    for (let i = 0; i < pu.length; i++) {
        pu[i].remove()
    }
`);
}
try {
    await driver.get(url);
    const tab = await driver.getWindowHandle();
    await clickPopunders(driver);
    await timeout(2000);

    const ads = await driver.findElements(s.By.css('iframe[width="728"], iframe[width="468"], iframe[width="300"]'));
    console.log(`Found ${ads.length} ads! Clicking...`)
    for (const ad of ads) {
        
        await driver.switchTo().frame(ad);
        const link = await driver.findElement(s.By.tagName('a'));
        try {
        await link.click();
        } catch {
            // intercepted click, attempt to click popunders
            console.log("Popunder intercepted click, getting rid of it...")
            await clickPopunders(driver);
        }
        //await driver.close();
        await driver.switchTo().window(tab); 
    }
    await closeOthers(driver,tab)
    await driver.switchTo().window(tab);
} catch (error) {
    console.error("Error:", error);
} finally {
    // get impressions before exiting 
    console.log("Farming impressions...")
    for (let i = 0; i < 8; i++) {
    
    await driver.executeScript("document.location = document.location")
    await timeout(1000)
    }
    console.log("Exiting!")
    await driver.quit();
}