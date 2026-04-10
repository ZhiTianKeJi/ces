import JDScraper from '../scrapers/jd.js';
import TaobaoScraper from '../scrapers/taobao.js';
import PDDScraper from '../scrapers/pdd.js';
import DataProcessor from './dataProcessor.js';

class ScraperService {
  private scrapers: any;
  private dataProcessor: DataProcessor;

  constructor() {
    this.scrapers = {
      jd: new JDScraper(),
      taobao: new TaobaoScraper(),
      pdd: new PDDScraper()
    };
    this.dataProcessor = new DataProcessor();
  }

  async scrape(keyword: string, platforms: string[] = ['jd', 'taobao', 'pdd'], limit: number = 20) {
    try {
      const scrapePromises = platforms.map(platform => {
        if (this.scrapers[platform]) {
          return this.scrapers[platform].scrape(keyword, limit);
        }
        return Promise.resolve([]);
      });

      const results = await Promise.all(scrapePromises);
      const allProducts = results.flat();
      const processedProducts = this.dataProcessor.process(allProducts);

      return processedProducts;
    } catch (error) {
      console.error('Scraping service error:', error);
      return [];
    }
  }
}

export default ScraperService;