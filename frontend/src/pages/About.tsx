import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Utensils, Heart, Shield, Clock, Star, Users } from 'lucide-react'
import Card from '../components/ui/Card'

const About = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Utensils,
      title: '精选美食',
      description: '严格筛选优质餐厅，保证每一餐都是享受',
    },
    {
      icon: Clock,
      title: '快速配送',
      description: '专业骑手团队，30分钟极速送达',
    },
    {
      icon: Shield,
      title: '安全保障',
      description: '全程食品安全监控，让您吃得放心',
    },
    {
      icon: Heart,
      title: '贴心服务',
      description: '7x24小时客服支持，随时解答您的疑问',
    },
  ]

  const stats = [
    { value: '1000+', label: '合作餐厅' },
    { value: '50万+', label: '用户信赖' },
    { value: '99.9%', label: '好评率' },
    { value: '24h', label: '全天服务' },
  ]

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
          <h1 className="text-2xl font-bold text-gray-800">关于我们</h1>
        </motion.div>

        {/* Logo & Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 mb-6 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
              <Utensils className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">美食外卖</h2>
            <p className="text-orange-100">让美食触手可及</p>
            <p className="mt-4 text-sm text-orange-100">版本 1.0.0</p>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-xl font-bold text-orange-500">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">我们的优势</h3>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="p-4 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-orange-500" />
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">我们的使命</h3>
            <p className="text-gray-600 leading-relaxed">
              我们致力于连接用户与优质餐厅，通过科技手段让每个人都能便捷地享受到美味佳肴。
              我们相信，美食不仅仅是填饱肚子，更是一种生活态度和情感的传递。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              每一份订单，我们都用心对待；每一次配送，我们都追求极致。
              因为我们知道，在屏幕的另一端，是一位期待美食的您。
            </p>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">联系方式</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>客服热线：400-123-4567</p>
              <p>客服邮箱：support@takeaway.com</p>
              <p>公司地址：北京市朝阳区某某大厦</p>
              <p>工作时间：周一至周日 9:00-21:00</p>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center mt-8 text-sm text-gray-400"
        >
          <p>© 2024 美食外卖 版权所有</p>
        </motion.div>
      </div>
    </div>
  )
}

export default About
