import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface Product {
  id: string;
  name: string;
  price: number;
  platform: string;
  url: string;
  image: string;
  sales?: number;
  rating?: number;
  shopName?: string;
  timestamp: number;
  valueScore?: number;
}

const Home: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['jd', 'taobao', 'pdd']);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');

  // 加载示例数据
  useEffect(() => {
    fetch('/api/results')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data);
        }
      });
  }, []);

  const handlePlatformChange = (platform: string) => {
    setPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          platforms,
          limit: 20
        })
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error || '搜索失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 准备图表数据
  const priceChartData = products.map(product => ({
    name: product.name.substring(0, 10) + '...',
    价格: product.price,
    平台: product.platform
  }));

  const radarChartData = products.slice(0, 5).map(product => ({
    subject: product.name.substring(0, 8) + '...',
    性价比: product.valueScore || 0,
    fullMark: 100
  }));

  const platformColors = {
    '京东': '#E74C3C',
    '淘宝': '#3498DB',
    '拼多多': '#27AE60'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center text-blue-600">
            电商商品价格对比工具
          </h1>
          <p className="text-center text-gray-600 mt-2">
            实时采集主流电商平台商品价格，帮助您做出明智的购买决策
          </p>
        </div>
      </header>

      {/* Search Form */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">商品搜索</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索关键词
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例如：笔记本电脑、手机、耳机"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择电商平台
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'jd', label: '京东', color: 'bg-red-100 text-red-600' },
                  { value: 'taobao', label: '淘宝', color: 'bg-blue-100 text-blue-600' },
                  { value: 'pdd', label: '拼多多', color: 'bg-green-100 text-green-600' }
                ].map(platform => (
                  <label key={platform.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platforms.includes(platform.value)}
                      onChange={() => handlePlatformChange(platform.value)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${platform.color}`}>
                      {platform.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  搜索中...
                </>
              ) : (
                '开始搜索'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      {products.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          {/* Data Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Price Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">价格对比</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priceChartData.slice(0, 10)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="价格" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value Score Radar Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">性价比分析</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="性价比"
                      dataKey="性价比"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">商品列表（按价格从低到高排序）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img 
                      src={product.image || 'https://via.placeholder.com/200'} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.platform === '京东' ? 'bg-red-100 text-red-600' : product.platform === '淘宝' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {product.platform}
                      </span>
                      {product.valueScore && product.valueScore > 80 && (
                        <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">
                          高性价比
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
                      {product.name}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-red-600">¥{product.price}</span>
                      {product.sales && (
                        <span className="text-sm text-gray-500">已售 {product.sales} 件</span>
                      )}
                    </div>
                    {product.shopName && (
                      <p className="text-sm text-gray-600 mt-1">{product.shopName}</p>
                    )}
                    {product.valueScore && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm">
                          <span>性价比</span>
                          <span className="font-medium">{product.valueScore}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(product.valueScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 rounded-lg transition-colors"
                    >
                      查看详情
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>电商商品价格自动化采集与对比工具 © 2026</p>
          <p className="text-gray-400 text-sm mt-2">
            数据仅供参考，实际价格以各平台为准
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;