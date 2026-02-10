
## 规格说明书（Spec）— 家长端·个性化成长档案模块

### 1. 文档信息
- 模块名称：家长端·个性化成长档案（Growth Profile）
- 版本：v1.0
- 适用端：前端（Vue 3 + Vite）与后端（NestJS + TypeORM）
- 鉴权：JWT 持有者令牌；角色为 PARENT 才能访问家长端接口
- API 基础地址：http://localhost:3000
- 请求头：Authorization: Bearer <token>, Content-Type: application/json

### 2. 背景与目标
为每位家长用户管理其孩子的成长档案，包括：
- 孩子基本信息管理（增删改查）
- 成长档案（身高、体重、行为观察、日常能力评分）查询与保存
- 健康记录（体检/就医等）增删改查

目标：在家长端页面中选择孩子后，可以查看并编辑成长档案；可记录健康记录；无孩子时支持快速创建。

### 3. 术语与角色
- 孩子（Child）：家长用户名下的儿童记录
- 成长档案（Growth Profile）：与孩子一一对应的档案记录
- 健康记录（Health Record）：孩子的就医/体检等历史
- 角色：PARENT（家长）

### 4. 范围
- 在家长端路径 /parent/growth-profile 页面内提供：
  - 孩子选择与创建
  - 成长档案查询/编辑/保存
  - 健康记录列表与增删改
- 后端接口在 /parent/growth/* 命名空间下

### 5. 功能需求

#### 5.1 孩子管理
- 列出当前家长的所有孩子
- 创建孩子（姓名、性别、出生日期、可选头像）
- 删除孩子
- 获取/更新单个孩子信息（如后续开放编辑）

前端行为：
- 页面顶部下拉选择孩子
- 当列表为空，显示“新建孩子”入口；创建成功后自动选中并加载档案

#### 5.2 成长档案
- 查询孩子的成长档案（若不存在后端会初始化空档案）
- 保存档案（可部分字段更新）
  - 体格发育：身高、体重、最近更新日期
  - 行为观察：优势、挑战、改善（字符串数组）
  - 日常技能评分：自理/沟通/社交/运动（0–100）

前端行为：
- 普通模式显示档案数据；点击“编辑档案”进入编辑模式
- 编辑模式下提供输入框，点击“保存”提交
- 保存成功后提示并返回普通模式
- 未选择孩子时不允许保存（弹窗提醒）
- 日期格式统一为 YYYY-MM-DD 提交

#### 5.3 健康记录
- 列表分页
- 新增（日期、类型、描述、结果）
- 更新（同字段）
- 删除（按记录 ID）

前端行为：
- Tab 内列表展示；编辑模式下显示“添加记录”“保存/删除”按钮

### 6. 数据模型

#### 6.1 Child（孩子）
- id: number
- name: string(<=50)
- gender: '男' | '女' | '未知'
- birthDate: string(YYYY-MM-DD)
- avatarUrl?: string | null

#### 6.2 GrowthProfile（成长档案）
- childId: number
- heightCm?: number|null（20–200，最多2位小数）
- weightKg?: number|null（5–100，最多2位小数）
- lastPhysicalUpdated?: string|null（YYYY-MM-DD）
- behaviorStrengths?: string[]（每项<=50，最多20项）
- behaviorChallenges?: string[]（每项<=50，最多20项）
- behaviorImprovements?: string[]（每项<=50，最多20项）
- dailySelfCare?: number（0–100）
- dailyCommunication?: number（0–100）
- dailySocial?: number（0–100）
- dailyMotor?: number（0–100）

#### 6.3 HealthRecord（健康记录）
- id: number
- childId: number
- date: string(YYYY-MM-DD)
- type: string
- description?: string
- result?: string

### 7. API 规格（家长端）

所有接口均需携带 Authorization: Bearer <token>（401 未登录将被重定向到 /login）

1) 列出孩子
- GET /parent/growth/children
- 响应: { items: Child[] }

2) 创建孩子
- POST /parent/growth/children
- 请求: { name: string; gender: '男'|'女'|'未知'; birthDate: string(YYYY-MM-DD); avatarUrl?: string }
- 响应: Child

3) 删除孩子
- DELETE /parent/growth/children/:childId
- 响应: { success: true }

4) 获取成长档案
- GET /parent/growth/children/:childId/profile
- 响应: { child: Child, currentStatus: CurrentStatusDTO }
  - currentStatusDTO 对应 GrowthProfile 字段（见数据模型，字段名略有差异）
  - 后端会在第一次访问时自动初始化空档案

5) 保存成长档案（部分更新）
- PUT /parent/growth/children/:childId/profile
- 请求（部分字段任选）:
  - heightCm?: number
  - weightKg?: number
  - lastPhysicalUpdated?: string(YYYY-MM-DD)
  - behaviorStrengths?: string[]
  - behaviorChallenges?: string[]
  - behaviorImprovements?: string[]
  - dailySelfCare?: number
  - dailyCommunication?: number
  - dailySocial?: number
  - dailyMotor?: number
- 响应: 同“获取成长档案”的响应结构

6) 健康记录列表
- GET /parent/growth/children/:childId/health-records?page=1&pageSize=20
- 响应: { items: HealthRecord[], total: number, page: number, pageSize: number }

7) 新增健康记录
- POST /parent/growth/children/:childId/health-records
- 请求: { date: string(YYYY-MM-DD); type: string; description?: string; result?: string }
- 响应: HealthRecord

8) 更新健康记录
- PUT /parent/growth/health-records/:recordId
- 请求: { date?: string; type?: string; description?: string; result?: string }
- 响应: HealthRecord

9) 删除健康记录
- DELETE /parent/growth/health-records/:recordId
- 响应: { success: true }

校验与错误：
- 数值/数组边界及日期格式不符将返回 400/422（DTO 校验失败）
- 非本人资源返回 403
- 未登录/Token 失效返回 401 并跳转到 /login

### 8. 交互与状态

- 初次进入页面：
  - 调用 GET /parent/growth/children
  - 若 items 为空，显示“新建孩子”表单入口
  - 若不为空，默认选中第一个孩子并加载档案与健康记录
- 保存：
  - 未选择孩子：弹窗“请先选择孩子后再保存”
  - 提交成功：提示“保存成功！”
  - 失败：弹窗“保存失败，请稍后重试”，并在控制台输出详细错误
- 日期输入：
  - 前端允许 2025/08/18，保存前会转换为 2025-08-18

### 9. 非功能需求
- 安全：所有家长端接口需 JWT；服务器已启用 CORS
- 性能：列表接口分页；档案获取单次查询
- 可用性：前端 editMode 切换编辑状态；保存有防重复提交

### 10. 示例请求

获取孩子列表
- curl -H "Authorization: Bearer TOKEN" http://localhost:3000/parent/growth/children

创建孩子
- curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name":"小明","gender":"男","birthDate":"2020-05-20"}' http://localhost:3000/parent/growth/children

获取档案
- curl -H "Authorization: Bearer TOKEN" http://localhost:3000/parent/growth/children/1/profile

保存档案
- curl -X PUT -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"heightCm":110,"weightKg":16,"lastPhysicalUpdated":"2025-08-18","behaviorStrengths":["自理强"],"dailySelfCare":11,"dailyCommunication":11,"dailySocial":11,"dailyMotor":11}' http://localhost:3000/parent/growth/children/1/profile

新增健康记录
- curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"date":"2025-08-18","type":"体检","description":"常规检查","result":"正常"}' http://localhost:3000/parent/growth/children/1/health-records

### 11. 验收标准（节选）
- 当没有孩子时，显示“新建孩子”入口；创建成功后自动选中并可保存档案
- 选择任一孩子后，能成功获取档案与健康记录列表
- 编辑并保存档案，后端成功写库并页面回显更新
- 健康记录支持新增/编辑/删除
- 所有接口在未登录时返回 401 并跳转登录页

### 12. 后续可扩展
- 档案变更历史审计
- BMI 自动计算与评估
- 行为标签建议库与智能推荐
- 健康记录附件上传（化验单、影像）

——
