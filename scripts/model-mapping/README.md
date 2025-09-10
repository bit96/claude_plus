# 模型映射自动化脚本

## 功能说明

自动为所有分组调度类型的Claude账户添加成本控制映射：
- **源模型**: `claude-opus-4-1-20250805` (Claude Opus 4.1)
- **目标模型**: `claude-sonnet-4-20250514` (Claude Sonnet 4)
- **目标**: 将昂贵的Opus请求自动转换为性价比更高的Sonnet请求

## 脚本特性

- ✅ **智能跳过**: 已存在映射的账户会被跳过
- ✅ **保留现有**: 保留账户的其他模型映射配置
- ✅ **幂等操作**: 重复执行不会产生副作用
- ✅ **错误处理**: 单个账户失败不影响其他账户
- ✅ **简洁输出**: 只显示必要的执行结果

## 使用方法

### 手动执行
```bash
cd /path/to/claude_plus
node scripts/model-mapping/update-opus-to-sonnet.js
```

### 定时执行 (推荐)
添加到crontab，每10分钟自动执行：

```bash
# 编辑crontab
crontab -e

# 添加以下行
*/10 * * * * cd /path/to/claude_plus && /usr/bin/node scripts/model-mapping/update-opus-to-sonnet.js >> logs/model-mapping.log 2>&1
```

## 输出示例

### 成功执行
```
✓ Processing completed: 3 updated, 2 skipped, 0 errors
```

### 执行失败
```
✗ Failed to update account claude_account_123: Connection timeout
✓ Processing completed: 2 updated, 2 skipped, 1 errors
```

### 无需处理
```
✓ No group accounts found
```

## 注意事项

1. **目标账户**: 脚本只处理 `accountType === 'group'` 的Claude账户
2. **权限要求**: 需要以有权访问项目服务和数据库的用户身份运行
3. **环境依赖**: 自动加载项目的 `.env` 配置文件
4. **日志输出**: 建议将输出重定向到日志文件以便监控

## 故障排除

### 常见问题

1. **模块加载失败**
   - 确保在项目根目录执行脚本
   - 检查 Node.js 版本兼容性

2. **数据库连接失败**
   - 确认 Redis 服务正在运行
   - 检查 `.env` 文件中的数据库配置

3. **权限不足**
   - 确保以正确的用户身份运行脚本
   - 检查文件和目录的读写权限

### 调试模式

如需调试，可以直接查看脚本输出：
```bash
node scripts/model-mapping/update-opus-to-sonnet.js
```

## 技术细节

- **脚本大小**: 约80行代码
- **执行时间**: 通常 < 5秒 (取决于账户数量)
- **内存占用**: 极小，适合频繁调度
- **依赖**: 仅使用项目现有的服务模块