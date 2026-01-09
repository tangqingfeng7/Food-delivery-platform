import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImage, getImageUrl } from '../api/upload'
import { toast } from '../store/useToastStore'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'wide'
}

const ImageUpload = ({
  value,
  onChange,
  placeholder = '点击或拖拽上传图片',
  className = '',
  aspectRatio = 'video',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 获取宽高比类名
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'wide':
        return 'aspect-[3/1]'
      default:
        return 'aspect-video'
    }
  }

  const handleFileSelect = async (file: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('格式错误', '仅支持 JPG、PNG、GIF、WebP 格式')
      return
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件过大', '文件大小不能超过 10MB')
      return
    }

    try {
      setUploading(true)
      const url = await uploadImage(file)
      onChange(url)
      toast.success('上传成功')
    } catch (error: any) {
      toast.error('上传失败', error.message || '请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // 清空 input 以便可以重复选择同一文件
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const handleClick = () => {
    if (!uploading) {
      inputRef.current?.click()
    }
  }

  const imageUrl = value ? getImageUrl(value) : ''

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${getAspectRatioClass()}
          ${dragOver
            ? 'border-blue-500 bg-blue-50'
            : value
              ? 'border-transparent'
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
          }
          ${uploading ? 'cursor-wait' : ''}
        `}
      >
        {/* 上传中 */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-500 mt-2">上传中...</span>
          </div>
        )}

        {/* 已有图片 */}
        {value && !uploading && (
          <>
            <img
              src={imageUrl}
              alt="已上传图片"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleClick}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-white/20 hover:bg-red-500 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* 空状态 */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-10 h-10 mb-2" />
            <span className="text-sm">{placeholder}</span>
            <span className="text-xs mt-1">支持 JPG、PNG、GIF、WebP，最大 10MB</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
