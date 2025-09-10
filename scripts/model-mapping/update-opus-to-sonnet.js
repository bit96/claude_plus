#!/usr/bin/env node

/**
 * 自动化模型映射脚本
 * 功能：为所有分组调度类型的Claude账户添加 Opus -> Sonnet 映射
 * 目标：成本控制，用 claude-sonnet-4-20250514 替代 claude-opus-4-1-20250805
 */

const path = require('path')

// 确保从项目根目录加载模块
const projectRoot = path.resolve(__dirname, '../..')
process.chdir(projectRoot)

// 加载项目环境和配置
try {
  require('dotenv').config()
} catch (error) {
  // 如果dotenv不可用，继续执行（可能环境变量已设置）
  console.warn('Warning: dotenv not available, using system environment variables')
}

// 引用项目服务
const claudeAccountService = require(path.join(projectRoot, 'src/services/claudeAccountService'))

// 映射配置
const MAPPING_CONFIG = {
  from: 'claude-opus-4-1-20250805',
  to: 'claude-sonnet-4-20250514'
}

/**
 * 主执行函数
 */
async function updateModelMappings() {
  try {
    // 获取所有Claude账户
    const accounts = await claudeAccountService.getAllAccounts()
    
    // 筛选分组调度类型的账户
    const groupAccounts = accounts.filter(account => account.accountType === 'group')
    
    if (groupAccounts.length === 0) {
      console.log('✓ No group accounts found')
      return
    }

    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    // 处理每个账户
    for (const account of groupAccounts) {
      try {
        // 获取当前的模型映射配置
        const currentMapping = account.modelMapping || {}
        
        // 检查是否已存在目标映射
        if (currentMapping[MAPPING_CONFIG.from]) {
          skippedCount++
          continue
        }

        // 添加新的映射（保留现有映射）
        const updatedMapping = {
          ...currentMapping,
          [MAPPING_CONFIG.from]: MAPPING_CONFIG.to
        }

        // 更新账户配置
        await claudeAccountService.updateAccount(account.id, {
          modelMapping: updatedMapping
        })

        updatedCount++

      } catch (error) {
        console.error(`✗ Failed to update account ${account.id}:`, error.message)
        errorCount++
      }
    }

    // 输出执行结果
    console.log(`✓ Processing completed: ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`)

    // 如果有错误，以非零状态码退出
    if (errorCount > 0) {
      process.exit(1)
    }

  } catch (error) {
    console.error('✗ Script execution failed:', error.message)
    process.exit(1)
  }
}

/**
 * 脚本入口点
 */
async function main() {
  // 防止多个实例同时运行的简单检查
  if (process.env.MODEL_MAPPING_RUNNING === 'true') {
    console.log('ℹ Script is already running, exiting')
    process.exit(0)
  }

  // 设置环境标志
  process.env.MODEL_MAPPING_RUNNING = 'true'

  try {
    await updateModelMappings()
  } finally {
    // 清除环境标志
    delete process.env.MODEL_MAPPING_RUNNING
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Promise Rejection:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('✗ Uncaught Exception:', error.message)
  process.exit(1)
})

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

module.exports = { updateModelMappings, MAPPING_CONFIG }