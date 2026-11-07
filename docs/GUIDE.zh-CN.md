**简体中文** | [English](GUIDE.en.md)

# 使用、配置与开发指南

[返回作品展示](../README.md)

## 快速开始

直接打开演示链接。`?demo=mon` 将“今天”设为周一，便于展示；去掉参数后按设备实际日期运行。

本地可直接用浏览器打开 `index.html`，或安装 Python 3 后从仓库根目录启动静态服务：

```bash
python3 -m http.server 8000
```

打开 `http://localhost:8000`。

## 使用说明

先编辑课表和物品，再到“今日”逐项检查。数据保存在当前浏览器 `localStorage`；没有服务端或跨设备同步。清除站点数据或使用设置中的清空功能会移除本地记录。

## 开发与文档

使用原生 HTML、CSS 和 JavaScript，零依赖、零构建。修改后在浏览器检查课表、清单、成就和数据保存流程。

- `index.html`：页面入口；`app.js`：业务逻辑；`styles.css`：手机优先样式。
- [需求文档](../docs/需求文档.md) · [设计说明](../docs/设计说明.md)
- [问题反馈](https://github.com/DrivingGodJ/xiaoshubao/issues)

## 许可与致谢

仓库尚未声明独立的整仓许可证。若需再分发或商用，请先确认授权。
