# CubeMate 魔方顶层练习网站

这是一个零依赖的前端原型，适合先验证你的想法：

- 展示顶层公式案例
- 手动录入新的 OLL / PLL / 自定义公式
- 给朋友创建每日练习任务
- 用“完成一把”来做打卡
- 导出 / 导入 JSON 数据

## 怎么打开

直接用浏览器打开 `/Users/owensun/Documents/Playground/index.html` 就可以使用。

## 当前版本特点

- 数据保存在浏览器本地 `localStorage`
- 适合先自己测试流程和页面
- 可以把导出的 JSON 发给朋友使用

## 如果你要做成真正的线上网站

下一步建议加这几个能力：

1. 用户登录
2. 云端数据库
3. 每个朋友独立账号和任务记录
4. 老师 / 管理者给朋友分配任务
5. 多设备同步打卡

## 文件说明

- `/Users/owensun/Documents/Playground/index.html` 页面结构
- `/Users/owensun/Documents/Playground/styles.css` 页面样式
- `/Users/owensun/Documents/Playground/app.js` 页面逻辑和本地数据保存
