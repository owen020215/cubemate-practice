# CubeMate 魔方顶层练习网站

这是一个零依赖的前端练习网站原型，适合先把魔方公式整理、练习流程和页面体验完整跑通。

## 线上地址

- 网站链接：[https://owen020215.github.io/cubemate-practice/](https://owen020215.github.io/cubemate-practice/)
- GitHub 仓库：[https://github.com/owen020215/cubemate-practice](https://github.com/owen020215/cubemate-practice)

## 怎么打开

直接用浏览器打开 [index.html](/Users/owensun/Documents/Playground/index.html) 就可以使用。

## 功能说明

### 1. 公式库

公式库用于整理和维护自己的魔方公式内容，当前支持：

- 录入公式名称
- 设置公式分类
- 通过点击格子的方式录入对应图像
- 输入公式并保存
- 保存后自动计算对应的打乱公式
- 根据分类筛选公式
- 根据名称、公式、标签内容进行搜索
- 编辑、删除和手动调整公式顺序

公式图像录入方式是可视化的：

- 默认是灰色块
- 点击格子后可以切换成黄色块
- 可以快速清空
- 也可以一键变成全黄

这样可以直接用图像来表示 OLL / PLL 或自定义顶层情况。

### 2. 练习中心

练习中心用于生成一组一组的练习任务，并进入练习模式。

当前支持：

- 创建新的练习内容
- 选择日期
- 填写训练重点
- 从公式库中按分类勾选需要练习的公式
- 统一设置每条公式练习多少次
- 保存为一组练习内容
- 对练习内容进行排序

已经创建好的练习内容会显示：

- 练习名
- 日期
- 训练重点
- 每条练习次数
- 当前完成进度
- 已经练习了多少轮
- 练习中包含哪些公式

### 3. 练习模式

进入练习模式后，系统会把每条公式按设定次数展开成一张张练习卡片。

默认显示内容：

- 当前公式的图像
- 当前公式的打乱公式

这时候如果已经会做，可以直接点击：

- `下一题`

如果不会做或者想检查答案，可以点击：

- `显示公式`

显示之后会补充展示：

- 正确公式
- 公式名字
- 备注 / 提示

如果这条公式还需要继续加强练习，可以点击：

- `加入加练并进入下一题`

这个功能会同时做两件事：

- 切换到下一题
- 把当前这条公式重新加入本轮练习队列，后面再出现一次

## 练习完成后的总结

一轮练习完成之后，页面会自动显示本次练习总结。

总结内容包括：

- 总共完成了多少题
- 本次有多少题是加练的
- 哪些公式被加入了加练
- 这些加练公式对应的图像
- 这些加练公式本身

这样可以很快回顾这一轮里哪些公式更容易出错、哪些还需要继续练。

## 发布数据到线上

现在项目里有一个 [data.json](/Users/owensun/Documents/Playground/data.json)，GitHub Pages 会把它当成线上默认数据源。

推荐流程：

1. 先在本地网页里修改公式、图片、练习内容
2. 点击页面里的“导出发布版 data.json”
3. 打开 GitHub 仓库首页，点击 `Add file`
4. 选择 `Upload files`
5. 上传刚刚导出的新 `data.json`
6. 保持文件名还是 `data.json`
7. 在页面底部填写提交说明，例如 `Update published data`
8. 点击 `Commit changes`
9. 等 GitHub Pages 更新后，线上链接就会显示新的默认内容

说明：

- 浏览器本地改动仍然会保存在 `localStorage`
- 线上默认内容以仓库里的 `data.json` 为准
- 页面里的“恢复线上发布版本”会把当前浏览器数据恢复到 `data.json` 对应的版本
- 如果你只是想更新线上内容，用 GitHub 网页上传新的 `data.json` 就可以，不一定要使用 Terminal

## 当前版本特点

- 数据保存在浏览器本地 `localStorage`
- 适合先自己测试流程和页面
- 可以通过 `data.json` 手动发布线上默认数据
- 可以把导出的 JSON 发给朋友使用

## 如果你要做成真正的线上网站

下一步建议加这几个能力：

1. 用户登录
2. 云端数据库
3. 每个朋友独立账号和任务记录
4. 管理者给不同朋友分配任务
5. 多设备同步练习和打卡

## 文件说明

- [index.html](/Users/owensun/Documents/Playground/index.html) 页面结构
- [styles.css](/Users/owensun/Documents/Playground/styles.css) 页面样式
- [app.js](/Users/owensun/Documents/Playground/app.js) 页面逻辑和本地数据保存
- [data.json](/Users/owensun/Documents/Playground/data.json) 线上默认发布数据
