const JDScraper = require('../scrapers/jd');
const TaobaoScraper = require('../scrapers/taobao');
const PDDScraper = require('../scrapers/pdd');
const DataProcessor = require('./dataProcessor');

class ScraperService {
  constructor() {
    this.scrapers = {
      jd: new JDScraper(),
      taobao: new TaobaoScraper(),
      pdd: new PDDScraper()
    };
    this.dataProcessor = new DataProcessor();
  }

  async scrape(keyword, platforms = ['jd', 'taobao', 'pdd'], limit = 20) {
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

module.exports = ScraperService;