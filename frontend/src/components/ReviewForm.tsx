import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import Button from './ui/Button'
import RatingStars from './RatingStars'
import ImageUpload from './ImageUpload'
import { createReview } from '../api/review'
import { toast } from '../store/useToastStore'
import type { CreateReviewRequest } from '../types'

interface ReviewFormProps {
  orderId: number
  onSuccess?: () => void
  onCancel?: () => void
}

const ReviewForm = ({ orderId, onSuccess, onCancel }: ReviewFormProps) => {
  const [tasteRating, setTasteRating] = useState(5)
  const [packagingRating, setPackagingRating] = useState(5)
  const [deliveryRating, setDeliveryRating] = useState(5)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const overallRating = ((tasteRating + packagingRating + deliveryRating) / 3).toFixed(1)

  const handleSubmit = async () => {
    if (submitting) return

    try {
      setSubmitting(true)

      const data: CreateReviewRequest = {
        orderId,
        tasteRating,
        packagingRating,
        deliveryRating,
        content: content.trim() || undefined,
        images: images.length > 0 ? images : undefined,
        isAnonymous
      }

      await createReview(data)
      toast.success('评价提交成功')
      onSuccess?.()
    } catch (error: any) {
      console.error('提交评价失败:', error)
      toast.error('提交失败', error.response?.data?.message || '请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">评价订单</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* 评分部分 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">口味</span>
          <RatingStars
            rating={tasteRating}
            size="lg"
            interactive
            onChange={setTasteRating}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">包装</span>
          <RatingStars
            rating={packagingRating}
            size="lg"
            interactive
            onChange={setPackagingRating}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">配送</span>
          <RatingStars
            rating={deliveryRating}
            size="lg"
            interactive
            onChange={setDeliveryRating}
          />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-gray-800 font-medium">综合评分</span>
          <span className="text-2xl font-bold text-orange-500">{overallRating}</span>
        </div>
      </div>

      {/* 评价内容 */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享您的用餐体验..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 图片上传 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">上传图片（可选，最多9张）</p>
        <ImageUpload
          images={images}
          onChange={setImages}
          maxCount={9}
        />
      </div>

      {/* 匿名选项 */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsAnonymous(!isAnonymous)}
        className="flex items-center gap-2 mb-6 text-sm text-gray-600 hover:text-gray-800"
      >
        {isAnonymous ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        <span>{isAnonymous ? '匿名评价' : '公开评价'}</span>
      </motion.button>

      {/* 提交按钮 */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            取消
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              提交中...
            </>
          ) : (
            '提交评价'
          )}
        </Button>
      </div>
    </div>
  )
}

export default ReviewForm
