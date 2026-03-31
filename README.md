# CubeMate 魔方顶层练习网站

这是一个零依赖的前端原型，适合先验证你的想法：

- 展示顶层公式案例
- 手动录入新的 OLL / PLL / 自定义公式
- 给朋友创建每日练习任务
- 用“完成一把”来做打卡
- 导出 / 导入 JSON 数据
- 使用 `data.json` 手动发布最新内容到线上

## 怎么打开

直接用浏览器打开 `/Users/owensun/Documents/Playground/index.html` 就可以使用。

## 发布数据到线上

现在项目里多了一个 `/Users/owensun/Documents/Playground/data.json`，GitHub Pages 会把它当成线上默认数据源。

推荐流程：

1. 先在本地网页里修改公式、图片、任务
2. 点击页面里的“导出发布版 data.json”
3. 用下载下来的文件覆盖仓库里的 `/Users/owensun/Documents/Playground/data.json`
4. 执行：
   - `git add data.json`
   - `git commit -m "Update published data"`
   - `git push`
5. 等 GitHub Pages 更新后，朋友打开线上链接就会看到新内容

说明：

- 浏览器本地改动仍然会保存在 `localStorage`
- 线上默认内容以仓库里的 `data.json` 为准
- 页面里的“恢复线上发布版本”会把当前浏览器数据恢复到 `data.json` 对应的版本

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
