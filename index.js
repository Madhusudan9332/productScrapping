const puppeteer = require("puppeteer");
const fs = require("fs");
let preData = [];
try{
  preData = require("./data.json");
}catch(err){
  console.log(err);
}

const run = async (query = "") => {
  if (query.trim() === "") return;
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://www.flipkart.com/");
    await page.waitForSelector(
      'input[title="Search for Products, Brands and More"]'
    );
    await page.type(
      'input[title="Search for Products, Brands and More"]',
      query
    );
    await page.keyboard.press("Enter"); // Simulate pressing the enter key

    const obj = {
      container: "._75nlfW",
      children: 4,
      image: "._53J4C-",
      brand: ".syl9yP",
      name: ".WKTcLC",
      actualPrice: ".yRaY8j",
      discount: ".UkUFwK",
      price: ".yRaY8j",
      sizes: ".OCRRMR",
    };
    try {
      // Wait for the containers to load
      await page.waitForSelector(obj.container);

      // Extract data from each container
      const data = await page.evaluate((obj) => {
        const id = Array.from(document.querySelectorAll(obj.container)) || [];
        const imageArray =
          Array.from(document.querySelectorAll(obj.image)) || [];
        const images = imageArray.map((image) => image.src);
        const brandArray =
          Array.from(document.querySelectorAll(obj.brand)) || [];
        const brands = brandArray.map((brand) => brand.textContent.trim());
        const nameArray = Array.from(document.querySelectorAll(obj.name)) || [];
        const names = nameArray.map((name) => name.textContent.trim());
        const actualPriceArray =
          Array.from(document.querySelectorAll(obj.actualPrice)) || [];
        const actualPrices = actualPriceArray.map((actualPrice) =>
          actualPrice.textContent.trim()
        );
        const discountArray =
          Array.from(document.querySelectorAll(obj.discount)) || [];
        const discounts = discountArray.map((discount) =>
          discount.textContent.trim()
        );
        const priceArray =
          Array.from(document.querySelectorAll(obj.price)) || [];
        const prices = priceArray.map((price) => price.textContent.trim());

        let result = [];
        for (let i = 0; i < images.length; i++) {
          try {
            result.push({
              id: Array.from(id[i/4].children)[i%4].getAttribute("data-id"),
              image: images[i],
              brand: brands[i],
              name: names[i],
              actualPrice: actualPrices[i],
              discount: discounts[i],
              price: prices[i],
            });
          } catch (error) {
            console.log(error);
          }
        }

        return result;
      }, obj);

      const updatedData = [...preData, ...data];
      fs.writeFileSync("data.json", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error during scraping:", error);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error during scraping:", error);
  }
};

module.exports = run;
