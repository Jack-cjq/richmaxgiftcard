import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Video } from '../entities/Video.js'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class VideoController {
  // 获取所有激活的视频（公开接口）
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Video)
      const videos = await repository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })

      res.json(videos)
    } catch (error) {
      console.error('Get public videos error:', error)
      res.status(500).json({ message: '获取失败' })
    }
  }

  // 获取所有视频（管理接口）
  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Video)
      const videos = await repository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })

      res.json(videos)
    } catch (error) {
      console.error('Get all videos error:', error)
      res.status(500).json({ message: '获取失败' })
    }
  }

  // 创建视频
  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Video)
      const { title, description, type, sortOrder, isActive, videoUrl } = req.body
      
      let finalVideoUrl = videoUrl
      let thumbnailUrl = req.body.thumbnailUrl || null

      // 如果有上传的视频文件
      if (req.file) {
        finalVideoUrl = `/videos/${req.file.filename}`
      }

      if (!finalVideoUrl) {
        return res.status(400).json({ message: '视频URL或文件必填' })
      }

      const video = repository.create({
        title: title || '',
        description: description || null,
        videoUrl: finalVideoUrl,
        thumbnailUrl,
        type: type || 'company',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })

      const saved = await repository.save(video)
      res.status(201).json(saved)
    } catch (error) {
      console.error('Create video error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  // 更新视频
  static async update(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Video)
      const id = parseInt(req.params.id)

      const video = await repository.findOne({ where: { id } })
      if (!video) {
        return res.status(404).json({ message: '视频不存在' })
      }

      const { title, description, type, sortOrder, isActive, videoUrl, thumbnailUrl } = req.body

      // 如果有新上传的视频文件
      if (req.file) {
        // 删除旧视频文件（如果存在且不是外部URL）
        if (video.videoUrl && !video.videoUrl.startsWith('http') && !video.videoUrl.startsWith('data:')) {
          try {
            const oldVideoPath = video.videoUrl.startsWith('/')
              ? path.join(__dirname, '../../..', 'frontend', 'public', video.videoUrl)
              : path.join(__dirname, '../../..', 'frontend', 'public', 'videos', video.videoUrl)
            await fs.unlink(oldVideoPath)
          } catch (error) {
            console.warn('删除旧视频文件失败:', error)
          }
        }
        video.videoUrl = `/videos/${req.file.filename}`
      } else if (videoUrl) {
        video.videoUrl = videoUrl
      }

      if (title !== undefined) video.title = title
      if (description !== undefined) video.description = description
      if (type !== undefined) video.type = type
      if (sortOrder !== undefined) video.sortOrder = sortOrder
      if (isActive !== undefined) video.isActive = isActive
      if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl

      const updated = await repository.save(video)
      res.json(updated)
    } catch (error) {
      console.error('Update video error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  // 删除视频
  static async delete(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Video)
      const id = parseInt(req.params.id)

      const video = await repository.findOne({ where: { id } })
      if (!video) {
        return res.status(404).json({ message: '视频不存在' })
      }

      // 删除视频文件（如果存在且不是外部URL）
      if (video.videoUrl && !video.videoUrl.startsWith('http') && !video.videoUrl.startsWith('data:')) {
        try {
          const videoPath = video.videoUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', video.videoUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'videos', video.videoUrl)
          await fs.unlink(videoPath)
        } catch (error) {
          console.warn('删除视频文件失败:', error)
        }
      }

      // 删除缩略图（如果存在）
      if (video.thumbnailUrl && !video.thumbnailUrl.startsWith('http') && !video.thumbnailUrl.startsWith('data:')) {
        try {
          const thumbnailPath = video.thumbnailUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', video.thumbnailUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'videos', video.thumbnailUrl)
          await fs.unlink(thumbnailPath)
        } catch (error) {
          console.warn('删除缩略图失败:', error)
        }
      }

      await repository.remove(video)
      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete video error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }
}

