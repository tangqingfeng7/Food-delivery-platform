import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, HelpCircle, ChevronDown, Search, MessageCircle, Phone, Mail } from 'lucide-react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

const faqs = [
  {
    category: '订单相关',
    questions: [
      {
        q: '如何取消订单？',
        a: '在"我的订单"页面找到需要取消的订单，点击"取消订单"按钮即可。注意：已开始制作的订单无法取消。',
      },
      {
        q: '订单配送时间是多久？',
        a: '一般配送时间为30-45分钟，具体时间取决于餐厅距离和当前订单量。您可以在订单详情页查看预计送达时间。',
      },
      {
        q: '可以修改订单吗？',
        a: '订单提交后暂不支持修改，建议取消后重新下单。如有特殊需求，可以联系客服处理。',
      },
    ],
  },
  {
    category: '支付问题',
    questions: [
      {
        q: '支持哪些支付方式？',
        a: '目前支持微信支付、支付宝、银行卡等多种支付方式。',
      },
      {
        q: '付款失败怎么办？',
        a: '请检查网络连接和支付账户余额，如仍有问题请联系客服。',
      },
    ],
  },
  {
    category: '配送服务',
    questions: [
      {
        q: '配送范围是多少？',
        a: '配送范围一般为餐厅周边3-5公里，具体以各餐厅设置为准。',
      },
      {
        q: '可以指定配送时间吗？',
        a: '部分餐厅支持预约配送功能，您可以在下单时选择期望的配送时间。',
      },
    ],
  },
  {
    category: '账户安全',
    questions: [
      {
        q: '如何修改密码？',
        a: '在"我的"->"账号安全"中可以修改登录密码。',
      },
      {
        q: '忘记密码怎么办？',
        a: '在登录页点击"忘记密码"，通过手机验证码重置密码。',
      },
    ],
  },
]

const Help = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.questions.length > 0)
    : faqs

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">帮助中心</h1>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Input
            placeholder="搜索问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </motion.div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">联系我们</h3>
            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-gray-600">在线客服</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-gray-600">电话客服</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-gray-600">邮件反馈</span>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">未找到相关问题</p>
            </div>
          ) : (
            filteredFaqs.map((category, categoryIndex) => (
              <Card key={category.category} className="overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">{category.category}</h3>
                </div>
                <div>
                  {category.questions.map((item, index) => {
                    const itemId = `${categoryIndex}-${index}`
                    const isExpanded = expandedItems.includes(itemId)
                    
                    return (
                      <div key={index} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-left text-gray-800">{item.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 text-gray-600 text-sm bg-orange-50/50">
                                {item.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Help
