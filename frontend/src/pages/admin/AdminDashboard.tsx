import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import zhCN from 'date-fns/locale/zh-CN'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // 每30秒自动刷新一次数据
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats()
      setStats(res.data)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '今日交易',
      value: stats?.todayTrades || 0,
      icon: '📊',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '今日金额',
      value: `¥${Number(stats?.todayAmount || 0).toLocaleString()}`,
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '总交易数',
      value: stats?.totalTrades || 0,
      icon: '📈',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '活跃产品',
      value: stats?.activeProducts || 0,
      icon: '📦',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">仪表盘</h1>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            刷新数据
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-md p-6 shadow-card border border-silver-200 animate-pulse"
              >
                <div className="h-6 bg-silver-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-silver-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-surface rounded-md p-6 shadow-card border border-silver-200 hover:shadow-dialog transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-md flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-600 font-medium">{stat.title}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近交易 */}
              <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
                <h2 className="text-xl font-bold text-neutral-700 mb-4">
                  最近交易
                </h2>
                {stats?.recentTrades && stats.recentTrades.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentTrades.map((trade: any) => (
                      <div
                        key={trade.id}
                        className="flex justify-between items-center p-4 bg-silver-50 rounded-md border border-silver-200 hover:bg-silver-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-700 mb-1">
                            {trade.productName}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm', {
                              locale: zhCN,
                            })}
                          </div>
                          <div className="text-xs text-neutral-400 mt-1">
                            {trade.currency} · 汇率: {Number(trade.exchangeRate).toFixed(4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ¥{Number(trade.totalAmount).toLocaleString()}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {Number(trade.amount).toLocaleString()} {trade.currency}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    暂无交易记录
                  </div>
                )}
              </div>

              {/* 系统信息 */}
              <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
                <h2 className="text-xl font-bold text-neutral-700 mb-4">
                  系统信息
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-silver-50 rounded-md border border-silver-200">
                    <span className="text-neutral-600 font-medium">汇率数量</span>
                    <span className="font-bold text-neutral-700">
                      {stats?.exchangeRateCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-silver-50 rounded-md border border-silver-200">
                    <span className="text-neutral-600 font-medium">产品总数</span>
                    <span className="font-bold text-neutral-700">
                      {stats?.totalProducts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-silver-50 rounded-md border border-silver-200">
                    <span className="text-neutral-600 font-medium">活跃产品</span>
                    <span className="font-bold text-green-600">
                      {stats?.activeProducts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-silver-50 rounded-md border border-silver-200">
                    <span className="text-neutral-600 font-medium">总交易金额</span>
                    <span className="font-bold text-green-600">
                      ¥{Number(stats?.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-silver-50 rounded-md border border-silver-200">
                    <span className="text-neutral-600 font-medium">今日交易金额</span>
                    <span className="font-bold text-blue-600">
                      ¥{Number(stats?.todayAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

