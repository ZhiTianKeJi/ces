#!/usr/bin/env node

const { program } = require('commander');
const ScraperService = require('./api/services/scraperService.js');
const fs = require('fs');
const path = require('path');

program
  .version('1.0.0')
  .description('电商商品价格自动化采集与对比工具')
  .option('-k, --keyword <keyword>', '搜索关键词')
  .option('-p, --platforms <platforms>', '电商平台，多个平台用逗号分隔，可选值：jd,taobao,pdd', 'jd,taobao,pdd')
  .option('-l, --limit <limit>', '每个平台的商品数量限制', '20')
  .option('-o, --output <output>', '输出格式，可选值：json,csv', 'json')
  .option('-f, --file <file>', '输出文件路径');

program.parse(process.argv);

const options = program.opts();

if (!options.keyword) {
  console.error('错误：必须指定搜索关键词');
  program.help();
  process.exit(1);
}

async function run() {
  console.log('开始采集商品信息...');
  console.log(`关键词: ${options.keyword}`);
  console.log(`平台: ${options.platforms}`);
  console.log(`限制: ${options.limit}`);
  
  const scraperService = new ScraperService();
  const platforms = options.platforms.split(',');
  
  try {
    const products = await scraperService.scrape(
      options.keyword,
      platforms,
      parseInt(options.limit)
    );
    
    console.log(`\n采集完成，共找到 ${products.length} 个商品`);
    
    // 按价格排序
    products.sort((a, b) => a.price - b.price);
    
    // 输出结果
    if (options.output === 'csv') {
      const csvContent = generateCSV(products);
      if (options.file) {
        fs.writeFileSync(options.file, csvContent);
        console.log(`\n结果已保存到 ${options.file}`);
      } else {
        console.log('\nCSV 结果:');
        console.log(csvContent);
      }
    } else {
      const jsonContent = JSON.stringify(products, null, 2);
      if (options.file) {
        fs.writeFileSync(options.file, jsonContent);
        console.log(`\n结果已保存到 ${options.file}`);
      } else {
        console.log('\nJSON 结果:');
        console.log(jsonContent);
      }
    }
    
    // 显示价格最低的商品
    if (products.length > 0) {
      console.log('\n价格最低的商品:');
      const cheapest = products[0];
      console.log(`平台: ${cheapest.platform}`);
      console.log(`名称: ${cheapest.name}`);
      console.log(`价格: ¥${cheapest.price}`);
      console.log(`销量: ${cheapest.sales || 0} 件`);
      console.log(`店铺: ${cheapest.shopName || '未知'}`);
      console.log(`链接: ${cheapest.url}`);
    }
    
  } catch (error) {
    console.error('采集过程中出现错误:', error);
  }
}

function generateCSV(products) {
  const headers = ['平台', '名称', '价格', '销量', '店铺', '链接', '性价比'];
  const rows = products.map(product => [
    product.platform,
    `"${product.name.replace(/"/g, '""')}"`,
    product.price,
    product.sales || 0,
    `"${product.shopName || ''}"`,
    `"${product.url}"`,
    product.valueScore || 0
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

run();