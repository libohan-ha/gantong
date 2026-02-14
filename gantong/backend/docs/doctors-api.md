# 医生资料管理 API 文档

## 概述

医生资料管理模块提供了医生用户管理个人资料和查看统计信息的功能。

## 认证

所有API都需要JWT认证，请在请求头中包含：
```
Authorization: Bearer <your-jwt-token>
```

## API 端点

### 1. 获取我的医生资料

**GET** `/doctors/me/profile`

获取当前登录医生的个人资料。如果资料不存在，会自动创建一个空的资料。

#### 响应示例
```json
{
  "userId": 10,
  "name": "张医生",
  "hospital": "北京儿童医院",
  "title": "主任医师",
  "age": 45,
  "phone": "13800138000",
  "verified": false
}
```

#### 字段说明
- `userId`: 用户ID
- `name`: 医生姓名
- `hospital`: 所在医院
- `title`: 职称
- `age`: 年龄
- `phone`: 手机号码
- `verified`: 是否已认证

### 2. 更新我的医生资料

**PATCH** `/doctors/me/profile`

更新当前登录医生的个人资料。

#### 请求体
```json
{
  "name": "张医生",
  "hospital": "北京儿童医院",
  "title": "主任医师",
  "age": 45,
  "phone": "13800138000"
}
```

#### 字段验证规则
- `name`: 可选，字符串，长度2-20个字符
- `age`: 可选，整数，范围18-100
- `title`: 可选，字符串，长度2-20个字符
- `phone`: 可选，字符串，必须是有效的手机号码格式
- `hospital`: 可选，字符串，长度2-50个字符

#### 响应示例
```json
{
  "userId": 10,
  "name": "张医生",
  "hospital": "北京儿童医院",
  "title": "主任医师",
  "age": 45,
  "phone": "13800138000",
  "verified": false
}
```

### 3. 获取我的统计信息

**GET** `/doctors/me/stats`

获取当前登录医生的统计信息，包括资料完整度等。

#### 响应示例
```json
{
  "videoCount": 0,
  "totalViews": 0,
  "totalLikes": 0,
  "profileCompleteness": 100
}
```

#### 字段说明
- `videoCount`: 视频数量（暂时为0，待后续实现）
- `totalViews`: 总观看次数（暂时为0，待后续实现）
- `totalLikes`: 总点赞数（暂时为0，待后续实现）
- `profileCompleteness`: 资料完整度百分比（0-100）

## 错误响应

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["姓名长度在 2 到 20 个字符"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "手机号已被其他医生使用"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "获取医生资料失败"
}
```

## 资料完整度计算

资料完整度基于以下字段计算：
- name（姓名）
- age（年龄）
- title（职称）
- phone（手机号）
- hospital（医院）

完整度 = (已填写字段数 / 总字段数) × 100%

## 测试示例

### 使用 PowerShell 测试

```powershell
# 设置token
$token = "your-jwt-token-here"

# 获取医生资料
Invoke-RestMethod -Uri "http://localhost:3000/doctors/me/profile" -Method GET -Headers @{"Authorization"="Bearer $token"}

# 更新医生资料
$body = @{
  name = "张医生"
  hospital = "北京儿童医院"
  title = "主任医师"
  age = 45
  phone = "13800138000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/doctors/me/profile" -Method PATCH -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -Body $body

# 获取统计信息
Invoke-RestMethod -Uri "http://localhost:3000/doctors/me/stats" -Method GET -Headers @{"Authorization"="Bearer $token"}
```

## 数据库表结构

### doctor_profiles 表
```sql
CREATE TABLE doctor_profiles (
  "userId" integer PRIMARY KEY,
  name varchar DEFAULT '',
  hospital varchar DEFAULT '',
  title varchar,
  age integer,
  phone varchar,
  verified boolean DEFAULT false,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);
```

## 注意事项

1. 所有API都需要有效的JWT token
2. 手机号码必须是唯一的，不能与其他医生重复
3. 如果医生资料不存在，GET和PATCH操作都会自动创建一个新的资料
4. 资料完整度会实时计算，不存储在数据库中
5. 目前视频相关统计数据为模拟数据，待后续视频模块实现后更新
