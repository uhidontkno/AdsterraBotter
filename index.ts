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

try {
    await driver.get(url);
    const tab = await driver.getWindowHandle();
    
    await timeout(2000);
    const popunders = await driver.findElements(s.By.css('div[style*="z-index: 2147483647;"][style*="position: fixed;"]'));
    for (const div of popunders) {
        console.log("Found (possible) popunder")
        const links = await div.findElements(s.By.tagName('a'));
        await links[0].click();
    }
    const ads = await driver.findElements(s.By.css('iframe[width="728"], iframe[width="468"], iframe[width="300"]'));
    for (const ad of ads) {
        console.log("Found (possible) ad");
        await driver.switchTo().frame(ad);
        const link = await driver.findElement(s.By.tagName('a'));
        await link.click();
        await driver.close();
        await driver.switchTo().window(tab); 
    }
    await closeOthers(driver,tab)
    await driver.switchTo().window(tab);
} catch (error) {
    console.error("Error:", error);
} finally {
    // await driver.quit();
}