import api from './client'

// 公开API
export const publicApi = {
  getExchangeRates: () => api.get('/public/exchange-rates'),
  getProducts: () => api.get('/public/products'),
  getRecentTrades: (limit = 10) => api.get(`/public/trades?limit=${limit}`),
  getAllTrades: (page = 1, limit = 20) => api.get(`/public/trades?page=${page}&limit=${limit}`),
  getContent: () => api.get('/public/content'),
  getSupportedCards: () => api.get('/public/supported-cards'),
  getCarousels: () => api.get('/public/carousels'),
  getCompanyImages: () => api.get('/public/company-images'),
  getProductById: (id: number) => api.get(`/public/products/${id}`),
  getConversionConfig: () => api.get('/public/conversion-config'),
  getVideos: () => api.get('/public/videos'),
  getSocialButtons: () => api.get('/public/social-buttons'),
}

// 管理员API
export const adminApi = {
  login: (username: string, password: string) =>
    api.post('/admin/login', { username, password }),
  
  // 汇率管理
  getExchangeRates: () => api.get('/admin/exchange-rates'),
  updateExchangeRate: (id: number, data: any) =>
    api.put(`/admin/exchange-rates/${id}`, data),
  createExchangeRate: (data: any) =>
    api.post('/admin/exchange-rates', data),
  deleteExchangeRate: (id: number) =>
    api.delete(`/admin/exchange-rates/${id}`),
  updateExchangeRates: () => api.post('/admin/exchange-rates/update'), // 手动触发更新

  // 支持的礼品卡管理
  getSupportedCards: () => api.get('/admin/supported-cards'),
  createSupportedCard: (data: any) => api.post('/admin/supported-cards', data),
  updateSupportedCard: (id: number, data: any) =>
    api.put(`/admin/supported-cards/${id}`, data),
  deleteSupportedCard: (id: number) =>
    api.delete(`/admin/supported-cards/${id}`),
  uploadCardImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/admin/supported-cards/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // 产品管理
  getProducts: () => api.get('/admin/products'),
  createProduct: (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        // 处理图片数组
        data[key].forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images', file)
          }
        })
      } else if (key !== 'images') {
        // 确保所有字段都被正确添加，包括空字符串
        const value = data[key]
        if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })
    return api.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateProduct: (id: number, data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        // 处理图片数组：区分File对象和字符串路径
        const imagePaths: string[] = []
        data[key].forEach((item: File | string) => {
          if (item instanceof File) {
            formData.append('images', item)
          } else if (typeof item === 'string') {
            imagePaths.push(item)
          }
        })
        // 将保留的图片路径作为JSON字符串传递
        if (imagePaths.length > 0) {
          formData.append('images', JSON.stringify(imagePaths))
        }
      } else if (key !== 'images') {
        // 确保所有字段都被正确添加，包括空字符串
        const value = data[key]
        if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      }
    })
    return api.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  
  // 交易记录管理
  getTrades: (page = 1, limit = 20) =>
    api.get(`/admin/trades?page=${page}&limit=${limit}`),
  createTrade: (data: any) => api.post('/admin/trades', data),
  updateTrade: (id: number, data: any) =>
    api.put(`/admin/trades/${id}`, data),
  deleteTrade: (id: number) => api.delete(`/admin/trades/${id}`),
  
  // 内容管理
  getContent: () => api.get('/admin/content'),
  updateContent: (data: any) => api.put('/admin/content', data),
  
  // 轮播图管理
  getCarousels: () => api.get('/admin/carousels'),
  createCarousel: (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key])
      } else if (key !== 'image') {
        formData.append(key, data[key])
      }
    })
    return api.post('/admin/carousels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateCarousel: (id: number, data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key])
      } else if (key !== 'image') {
        formData.append(key, data[key])
      }
    })
    return api.put(`/admin/carousels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteCarousel: (id: number) => api.delete(`/admin/carousels/${id}`),
  
  // 公司图片管理
  getCompanyImages: () => api.get('/admin/company-images'),
  createCompanyImage: (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key])
      } else if (key !== 'image') {
        formData.append(key, data[key])
      }
    })
    return api.post('/admin/company-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateCompanyImage: (id: number, data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append('image', data[key])
      } else if (key !== 'image') {
        formData.append(key, data[key])
      }
    })
    return api.put(`/admin/company-images/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteCompanyImage: (id: number) => api.delete(`/admin/company-images/${id}`),
  
  // 系统配置管理
  getBaseCurrency: () => api.get('/admin/config/base-currency'),
  updateBaseCurrency: (baseCurrency: string) =>
    api.put('/admin/config/base-currency', { baseCurrency }),
  getConfig: () => api.get('/admin/config'),
  
  // 换算配置管理
  getConversionConfig: () => api.get('/admin/conversion-config'),
  updateConversionConfig: (data: any) =>
    api.put('/admin/conversion-config', data),
  
  // 统计数据
  getStats: () => api.get('/admin/stats'),
  
  // 视频管理
  getVideos: () => api.get('/admin/videos'),
  createVideo: (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'video' && data[key] instanceof File) {
        formData.append('video', data[key])
      } else if (key !== 'video') {
        formData.append(key, data[key])
      }
    })
    return api.post('/admin/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateVideo: (id: number, data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'video' && data[key] instanceof File) {
        formData.append('video', data[key])
      } else if (key !== 'video') {
        formData.append(key, data[key])
      }
    })
    return api.put(`/admin/videos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteVideo: (id: number) => api.delete(`/admin/videos/${id}`),
  
  // 社交按钮管理
  getSocialButtons: () => api.get('/admin/social-buttons'),
  createSocialButton: (data: any) => api.post('/admin/social-buttons', data),
  updateSocialButton: (id: number, data: any) =>
    api.put(`/admin/social-buttons/${id}`, data),
  deleteSocialButton: (id: number) => api.delete(`/admin/social-buttons/${id}`),
  updateSocialButtonsBatch: (buttons: any[]) =>
    api.put('/admin/social-buttons/batch', { buttons }),
}

