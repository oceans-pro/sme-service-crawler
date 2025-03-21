const XLSX = require('xlsx');
const fs = require('fs');

const json = require('./data/filter-with-summary.json');

function exportToExcel(keyword) {
    // 筛选包含指定关键词的数据
    const filteredData = json.filter(item => item.keywords.includes(keyword));

    // 准备 Excel 数据
    const excelData = filteredData.map(item => ({
        标题: item.title,
        单位: item.unit,
        主题: item.subjectName,
        发布时间: item.publishTime,
        原始链接: item.url || `https://www.sme-service.cn/#/detail?id=${item.id}&num=0`,
        sme链接: `https://www.sme-service.cn/#/detail?id=${item.id}&num=0`,
        总结: item.summary,
        发文号: item.publishNo,
    }));

    // 创建 Excel 工作簿
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, `${keyword}数据`);

    // 写入 Excel 文件
    const fileName = `./data/${keyword}数据.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log(`Excel 文件已生成：${fileName}`);
}

// 示例用法
exportToExcel('科技金融');
exportToExcel('普惠金融');
exportToExcel('民营经济');

