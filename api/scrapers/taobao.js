import puppeteer from 'puppeteer';

class TaobaoScraper {
  constructor() {
    this.baseUrl = 'https://s.taobao.com';
  }

  async scrape(keyword, limit = 20) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    try {
      // 访问淘宝搜索页面
      await page.goto(`${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 等待商品加载
      await page.waitForSelector('.J_MouserOnverReq', { timeout: 15000 });

      // 抓取商品信息
      const products = await page.evaluate((limit) => {
        const items = document.querySelectorAll('.J_MouserOnverReq');
        const results = [];
        
        for (let i = 0; i < Math.min(items.length, limit); i++) {
          const item = items[i];
          
          try {
            const name = item.querySelector('.title a')?.textContent?.trim() || '';
            const price = parseFloat(item.querySelector('.price')?.textContent?.trim().replace(/[^0-9.]/g, '')) || 0;
            const url = item.querySelector('.title a')?.href || '';
            const image = item.querySelector('.img img')?.src || item.querySelector('.img img')?.dataset.src || '';
            const sales = parseInt(item.querySelector('.deal-cnt')?.textContent?.trim().replace(/[^0-9]/g, '')) || 0;
            const shopName = item.querySelector('.shop a')?.textContent?.trim() || '';
            
            if (name && price > 0) {
              results.push({
                id: `taobao_${Date.now()}_${i}`,
                name,
                price,
                platform: '淘宝',
                url,
                image,
                sales,
                shopName,
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error parsing Taobao product:', error);
          }
        }
        
        return results;
      }, limit);

      return products;
    } catch (error) {
      console.error('Taobao scraping error:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
}

export default TaobaoScraper;