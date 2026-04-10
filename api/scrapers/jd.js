import puppeteer from 'puppeteer';

class JDScraper {
  constructor() {
    this.baseUrl = 'https://search.jd.com';
  }

  async scrape(keyword, limit = 20) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    try {
      // 访问京东搜索页面
      await page.goto(`${this.baseUrl}/Search?keyword=${encodeURIComponent(keyword)}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 等待商品加载
      await page.waitForSelector('.gl-item', { timeout: 15000 });

      // 抓取商品信息
      const products = await page.evaluate((limit) => {
        const items = document.querySelectorAll('.gl-item');
        const results = [];
        
        for (let i = 0; i < Math.min(items.length, limit); i++) {
          const item = items[i];
          
          try {
            const name = item.querySelector('.p-name em')?.textContent?.trim() || '';
            const price = parseFloat(item.querySelector('.p-price .price')?.textContent?.trim().replace(/[^0-9.]/g, '')) || 0;
            const url = item.querySelector('.p-img a')?.href || '';
            const image = item.querySelector('.p-img img')?.src || item.querySelector('.p-img img')?.dataset.lazysrc || '';
            const sales = parseInt(item.querySelector('.p-commit')?.textContent?.trim().replace(/[^0-9]/g, '')) || 0;
            const shopName = item.querySelector('.p-shop a')?.textContent?.trim() || '';
            
            if (name && price > 0) {
              results.push({
                id: `jd_${Date.now()}_${i}`,
                name,
                price,
                platform: '京东',
                url,
                image,
                sales,
                shopName,
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error parsing JD product:', error);
          }
        }
        
        return results;
      }, limit);

      return products;
    } catch (error) {
      console.error('JD scraping error:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
}

export default JDScraper;