# Role

你是一个资深的 Full-Stack 产品工程师，精通 React, Tailwind CSS, Lucide Icons 和 Shadcn UI。你擅长根据后端逻辑反推直观、现代且具有极简美感的用户界面。

# Context & Input

1. **项目文档**：docs/下的文档

2. **后端代码**：xiaowai-backend

3. **技术栈**：Vite + React + Tailwind CSS + TypeScript + Axios。

# Design Principles

- **审美风格**：参考 Linear 或 Vercel 的极简主义。深色模式友好，使用大面积留白、细边框（border-slate-200/80）和柔和的阴影。

- **交互逻辑**：响应式布局（移动端适配），包含加载状态（Skeleton）、错误处理（Toast）和空状态提示。

- **图标**：统一使用 Lucide-react，风格保持轻量。

# Task Requirements

请根据提供的后端数据结构，生成一个名为 xiaowai-web（小歪）的前端项目：

1. **数据对接**：定义与后端 Request/Response 匹配的 TypeScript Interface。

2. **状态管理**：使用 React Hooks 管理表单输入和 API 请求状态。

3. **布局细节**：

- 侧边栏/导航栏需包含 [具体功能]。

- 核心展示区采用 [网格/列表] 布局。

- 对话记录需支持 Markdown 渲染。

4. **代码质量**：模块化组件设计，逻辑与 UI 分离，包含必要的注释。

自行联调测试前后端项目交互逻辑
做完之后给出一份用户操作说明.md

将前端项目使用Nginx代理到80端口
记得调用skill