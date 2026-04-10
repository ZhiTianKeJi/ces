/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import ScraperService from './services/scraperService.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()
const scraperService = new ScraperService()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)

// API endpoint for scraping product data
app.post('/api/scrape', async (req: Request, res: Response) => {
  try {
    const { keyword, platforms = ['jd', 'taobao', 'pdd'], limit = 20 } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }
    
    const products = await scraperService.scrape(keyword, platforms, limit);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Scrape API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint for retrieving results (demo data)
app.get('/api/results', (req: Request, res: Response) => {
  const demoData = [
    {
      id: 'jd_1',
      name: 'Apple iPhone 15 Pro Max 256GB 钛金属',
      price: 9999,
      platform: '京东',
      url: 'https://item.jd.com/100062591386.html',
      image: 'https://img10.360buyimg.com/n0/jfs/t1/214853/37/36914/99305/655c7c70F2c6b3a64/9a9a9a9a9a9a9a9a.jpg',
      sales: 12345,
      shopName: 'Apple京东自营旗舰店',
      timestamp: Date.now(),
      valueScore: 85.5
    },
    {
      id: 'taobao_1',
      name: 'Apple iPhone 15 Pro Max 256GB 原色钛金属',
      price: 9899,
      platform: '淘宝',
      url: 'https://item.taobao.com/item.htm?id=7444444444',
      image: 'https://img.alicdn.com/imgextra/i4/1234567890/O1CN01abcdefghijklmnopqrstuvwxyz_!!1234567890.jpg',
      sales: 9876,
      shopName: 'Apple官方旗舰店',
      timestamp: Date.now(),
      valueScore: 82.3
    },
    {
      id: 'pdd_1',
      name: 'Apple iPhone 15 Pro Max 256GB 钛金属色',
      price: 9799,
      platform: '拼多多',
      url: 'https://mobile.yangkeduo.com/goods.html?id=123456789',
      image: 'https://img.pddpic.com/123456789.jpg',
      sales: 7654,
      shopName: 'Apple官方旗舰店',
      timestamp: Date.now(),
      valueScore: 79.8
    }
  ];
  res.json({ success: true, data: demoData });
});

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
