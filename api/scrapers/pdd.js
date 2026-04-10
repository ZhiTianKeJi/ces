import puppeteer from 'puppeteer';

class PDDScraper {
  constructor() {
    this.baseUrl = 'https://mobile.yangkeduo.com';
  }

  async scrape(keyword, limit = 20) {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    try {
      // 设置用户代理为移动设备
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
      
      // 访问拼多多搜索页面
      await page.goto(`${this.baseUrl}/search_result.html?search_key=${encodeURIComponent(keyword)}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 等待商品加载
      await page.waitForSelector('.goods-list .goods-item', { timeout: 15000 });

      // 抓取商品信息
      const products = await page.evaluate((limit) => {
        const items = document.querySelectorAll('.goods-list .goods-item');
        const results = [];
        
        for (let i = 0; i < Math.min(items.length, limit); i++) {
          const item = items[i];
          
          try {
            const name = item.querySelector('.goods-title')?.textContent?.trim() || '';
            const price = parseFloat(item.querySelector('.goods-price')?.textContent?.trim().replace(/[^0-9.]/g, '')) || 0;
            const url = item.querySelector('a')?.href || '';
            const image = item.querySelector('.goods-image img')?.src || '';
            const sales = parseInt(item.querySelector('.goods-sales')?.textContent?.trim().replace(/[^0-9]/g, '')) || 0;
            const shopName = item.querySelector('.shop-name')?.textContent?.trim() || '';
            
            if (name && price > 0) {
              results.push({
                id: `pdd_${Date.now()}_${i}`,
                name,
                price,
                platform: '拼多多',
                url,
                image,
                sales,
                shopName,
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error parsing PDD product:', error);
          }
        }
        
        return results;
      }, limit);

      return products;
    } catch (error) {
      console.error('PDD scraping error:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
}

export default PDDScraper;