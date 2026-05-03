# Color Run: AI-Driven 2D Procedural Generation Game

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![AI-Powered](https://img.shields.io/badge/Development-AI--Driven-orange)

## 📖 项目简介
**Color Run** 是一款基于 JavaScript 打造的 Web 2D 竞技躲避类游戏。玩家需要操控角色根据颜色匹配机制躲避障碍。本项目最大的技术特色在于**深度集成了 AI Agent 开发流**，通过系统化的 Prompt 约束和自动化阵型生成，解决了独立游戏开发中关卡配置冗长、调试困难的痛点。

---

## 🛠️ 技术栈
- **核心架构:** JavaScript / HTML5 Canvas / WebGL
- **AI 协同工具:** Trae (Next-generation AI IDE)
- **底层模型:** Claude 3.5 Sonnet / Gemini 1.5 Pro
- **开发规范:** 严格遵循 `.traerules` 级联式指令集

---

## 🤖 AI 深度集成实践 (MIMO 核心展示)

本项目不仅是利用 AI 编写代码，更是构建了一套 **AI 自动化生产线**：

### 1. 结构化阵型库自动化 (PatternLibrary)
通过制定严格的代码模板约束，AI 能够自动化生成复杂的障碍物阵型。这些阵型并非随机堆砌，而是包含了精准的数学运动模型：
- **Static:** 静态布局优化
- **Rotor:** 旋转干扰逻辑
- **Sine/Pulse:** 基于正弦函数和脉冲的周期性位移
- **Dash:** 突发性冲刺预警机制

### 2. 测试闭环与 UI 映射 (Testing System)
针对 AI 生成内容的不可控性，我开发了一套实时测试工具。利用 AI 快速重构了 UI 渲染层，使得 `patterns.js` 中的每个阵型组 `name` 属性能够直接在测试阶段显示在游戏画面上方。
- **价值:** 极大地缩短了“发现不合理阵型 -> 定位 ID -> 指令 AI 批量剔除”的反馈周期。

### 3. 系统级约束与规范化 (.traerules)
利用 Trae 的系统级约束功能，确保 AI 在处理长上下文逻辑（如 Canvas 响应式适配、粒子爆炸系统重构）时，始终保持代码风格的一致性和逻辑的高健壮性。

---

## 🌟 核心功能
- **色彩匹配机制:** 动态颜色判定的实时碰撞检测。
- **粒子特效系统:** 针对角色死亡和障碍物碰撞优化的 Explosion Particles。
- **高响应式布局:** 完美适配各种浏览器缩放比例，解决 Canvas 图像拉伸痛点。
- **交互系统:** 包含完整的死亡结算、暂停菜单及 ESC 快捷键响应逻辑。

---

## 👨‍💻 作者
**陈小龙**
游戏制作人 / AI 技术探索者

---

## 📄 许可证
本项目采用 MIT 许可证。
