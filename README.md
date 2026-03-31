# CubeMate 魔方顶层练习网站

这是一个零依赖的前端原型，适合先验证你的想法：

- 展示顶层公式案例
- 手动录入新的 OLL / PLL / 自定义公式
- 给朋友创建每日练习任务
- 用“完成一把”来做打卡
- 导出 / 导入 JSON 数据
- 使用 `data.json` 手动发布最新内容到线上

## 线上地址

- 网站链接：[https://owen020215.github.io/cubemate-practice/](https://owen020215.github.io/cubemate-practice/)
- GitHub 仓库：[https://github.com/owen020215/cubemate-practice](https://github.com/owen020215/cubemate-practice)

## 怎么打开

直接用浏览器打开 `/Users/owensun/Documents/Playground/index.html` 就可以使用。

## 发布数据到线上

现在项目里多了一个 `/Users/owensun/Documents/Playground/data.json`，GitHub Pages 会把它当成线上默认数据源。

推荐流程：

1. 先在本地网页里修改公式、图片、任务
2. 点击页面里的“导出发布版 data.json”
3. 打开 GitHub 仓库首页，点击 `Add file`
4. 选择 `Upload files`
5. 上传刚刚导出的新 `data.json`
6. 保持文件名还是 `data.json`
7. 在页面底部填写提交说明，例如 `Update published data`
8. 点击 `Commit changes`
9. 等 GitHub Pages 更新后，朋友打开线上链接就会看到新内容

说明：

- 浏览器本地改动仍然会保存在 `localStorage`
- 线上默认内容以仓库里的 `data.json` 为准
- 页面里的“恢复线上发布版本”会把当前浏览器数据恢复到 `data.json` 对应的版本
- 如果你只是想更新线上内容，用 GitHub 网页上传新的 `data.json` 就可以，不一定要使用 Terminal

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
