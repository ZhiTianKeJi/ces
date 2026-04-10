class DataProcessor {
  // 清洗数据
  cleanData(products) {
    return products.map(product => ({
      ...product,
      name: product.name.replace(/\s+/g, ' ').trim(),
      price: parseFloat(product.price) || 0,
      sales: parseInt(product.sales) || 0,
      rating: parseFloat(product.rating) || 0
    })).filter(product => product.price > 0 && product.name);
  }

  // 去重数据
  deduplicateData(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = `${product.name}_${product.platform}_${product.price}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // 按价格排序
  sortByPrice(products) {
    return products.sort((a, b) => a.price - b.price);
  }

  // 计算性价比分数
  calculateValueScore(products) {
    return products.map(product => {
      // 简单的性价比计算：销量越高、价格越低，性价比越高
      const baseScore = (product.sales || 1) / (product.price || 1);
      const normalizedScore = Math.min(baseScore * 100, 100);
      return {
        ...product,
        valueScore: parseFloat(normalizedScore.toFixed(2))
      };
    });
  }

  // 处理数据
  process(products) {
    let processed = this.cleanData(products);
    processed = this.deduplicateData(processed);
    processed = this.sortByPrice(processed);
    processed = this.calculateValueScore(processed);
    return processed;
  }
}

module.exports = DataProcessor;