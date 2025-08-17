# CLAUDE.md

本文件为Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个名为"慧悦-学院"的感觉统合训练平台，使用Vue 3 + TypeScript构建。该平台为三个不同的用户群体提供服务：医院、家长和学校，每个群体都有专门的感觉统合训练和管理功能。

## 架构设计

### 前端结构
- **单页应用程序**，使用Vue 3 Composition API
- **TypeScript** 确保整个应用的类型安全
- **Vite** 作为构建工具和开发服务器
- **Pinia** 用于状态管理
- **Vue Router** 使用懒加载优化性能

### 三层用户系统
1. **医院端门户** (`/hospital/*` 路由)：6个功能类别，包括视频上传、隐私保护、预约管理
2. **家长端门户** (`/parent/*` 路由)：6个功能类别，包括专家课程、感觉测试、训练基地
3. **学校端门户** (`/school/*` 路由)：3个功能模块，包括环境训练、研学旅行

### 关键目录结构
- `frontend/src/views/`：按用户类型组织的主要应用视图（总计16个路由）
- `frontend/src/components/`：可复用的Vue组件
- `frontend/src/router/`：使用懒加载的路由定义
- `frontend/src/stores/`：Pinia状态管理存储
- `frontend/src/assets/`：静态资源和样式

### 路由架构
应用使用扁平化路由结构，组件懒加载：
- 首页路由急加载 `HomeView.vue`
- 其他所有路由使用动态导入：`() => import('../views/ComponentName.vue')`
- 医院路由：`/hospital/*` 下的5个子路由
- 家长路由：`/parent/*` 下的6个子路由
- 学校路由：1个主路由 `/school`

## 开发命令

### 主要开发命令
```bash
cd frontend
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
```

### 代码质量
```bash
npm run lint         # 运行ESLint
npm run format       # 使用Prettier格式化代码
npm run type-check   # TypeScript类型检查
```

### 测试
```bash
npm run test:unit    # 运行Vitest单元测试
npm run test:e2e     # 运行Cypress端到端测试
npm run test:e2e:dev # 在开发模式下运行Cypress
```

## 配置文件

### 构建配置
- `vite.config.ts`：Vite配置，包含路径别名和TypeScript支持
- `tsconfig.json`：主要TypeScript配置
- `tsconfig.app.json`：应用特定TypeScript设置
- `tsconfig.node.json`：Node.js TypeScript配置

### 代码质量
- `eslint.config.ts`：现代扁平化配置的ESLint，支持Vue 3 + TypeScript以及Vitest和Cypress插件
- `prettier`（通过package.json）：使用`npm run format`进行代码格式化
- `vitest.config.ts`：Vitest测试配置，使用jsdom环境
- `cypress.config.ts`：Cypress端到端测试设置

## 开发模式

### 组件结构
- 单文件组件（SFC）使用`<script setup>`语法
- TypeScript接口在组件内部定义
- 使用`ref()`和`computed()`的Composition API响应式模式
- 属性和事件使用适当的TypeScript类型

### 当前实现模式
- **训练模块**：6种感觉统合训练类型，配有3-4分钟计时器
- **隐私保护**：HIPAA级别的医疗数据保护，三层安全机制
- **实时功能**：游戏计时器、进度跟踪、动态评分系统
- **响应式设计**：移动优先的方法，使用CSS Grid和Flexbox

### 路由
- 懒加载路由以获得更好的性能（除首页外的所有路由都使用动态导入）
- 扁平化路由结构，无嵌套路由
- 基于路由的代码分割，三个用户门户共16个路由

### 状态管理
- Pinia存储用于全局状态（存在计数器存储示例）
- 使用Vue 3 Composition API的本地组件状态
- 使用`ref()`、`computed()`和生命周期钩子的响应式数据模式

## 浏览器支持
- 支持ES6+的现代浏览器
- 移动优先的响应式设计
- 渐进式Web应用（PWA）功能

## 关键依赖
- Vue 3.5.17 with Composition API
- TypeScript 5.8
- Vite 7.0 构建工具
- Pinia 3.0.3 状态管理
- Vue Router 4.5.1 路由
- Vitest 3.2.4 单元测试
- Cypress 14.5.0 端到端测试

## 测试模式

### 单元测试
- **位置**：`src/components/__tests__/`
- **框架**：Vitest with jsdom环境
- **模式**：`ComponentName.spec.ts`文件
- **示例**：`HelloWorld.spec.ts`演示了Vue Test Utils的mount()用法

### 端到端测试
- **框架**：Cypress with start-server-and-test
- **命令**：`npm run test:e2e`（生产）或`npm run test:e2e:dev`（开发）
- **端口**：测试在localhost:4173上运行

## 开发工作流程

### 添加新功能
1. 在`frontend/src/views/`中创建视图组件
2. 使用懒加载将路由添加到`frontend/src/router/index.ts`
3. 在组件内部实现TypeScript接口
4. 遵循现有的实时功能和响应式设计模式

### 关键已实现功能
- **TrainingBaseView.vue**：6个感觉训练模块，配有游戏计时器
- **CasePrivacyView.vue**：HIPAA级别隐私保护系统
- **SchoolView.vue**：3模块环境训练系统

## 应用特定上下文

### 医疗数据处理
- 三级隐私保护规则
- 文件加密和匿名化
- 局部/部分身体区域上传限制
- 医生身份验证系统

### 训练系统架构
- 6个感觉统合类别：前庭觉、本体觉、触觉、视觉、听觉、协调
- 严格的3-4分钟游戏时间限制
- 实时评分和进度跟踪
- 个性化训练计划生成