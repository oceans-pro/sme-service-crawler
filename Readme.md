分为两大步骤

## 一、爬虫 & 存储

需要安装nodejs (https://nodejs.org/en/)

见 `1-fetch.js`

```sh
node 1-fetch.js
```

## 二、 文件格式转换

转为docx文件

在 **爬虫 & 存储** 的基础上, 还需要安装 `pandoc`。 (https://pandoc.org/installing.html)

``` sh
npm i # 安装nodejs依赖
```

```sh
node ./2-json-to-md.js # 这一步需要nodejs依赖!!
```

```sh
pandoc ./data/output.md -o ./data/output.docx # 这一步需要安装pandoc!!
```
