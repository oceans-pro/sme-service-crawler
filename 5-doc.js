const fs = require('fs-extra');
const pth = require('path');
const { Document, Paragraph, TextRun, HeadingLevel, Packer } = require('docx');

const json = require('./data/filter.json');

json.forEach((i) => {
    i.keywords.forEach(async (kw) => {
        const dir = pth.join(__dirname, './word/' + kw + '/' + i.unit + '/' + i.subjectName);
        const fileName = i.title.trim().replaceAll(' ', '') + '.docx';
        const filePath = pth.join(dir, fileName);

        // Create Word document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // Title as Heading 1
                        new Paragraph({
                            heading: HeadingLevel.HEADING_1,
                            alignment: 'center',
                            children: [
                                new TextRun({
                                    text: i.title,
                                    color: '000000', // 蓝色的十六进制颜色代码
                                    size: 32, // 可选:设置字体大小(半点值)
                                    // - `'KaiTi'` - 楷体
                                    // - `'SimSun'` - 宋体
                                    // - `'Microsoft YaHei'` - 微软雅黑
                                    // - `'FangSong'` - 仿宋
                                    // - `'SimHei'` - 黑体
                                    font: 'SimHei', // 楷体
                                    bold: true // 可选:设置为粗体
                                })
                            ]
                        }),
                        // Empty paragraph for spacing
                        new Paragraph({
                            text: '',
                            spacing: {
                                after: 400,
                            },
                        }),
                        // Year as normal paragraph
                        new Paragraph({
                            text: '发布时间: ' + i.publishTime,
                            alignment: 'left',
                        }),
                        // URL paragraph
                        new Paragraph({
                            text: `·链接: https://www.sme-service.cn/#/detail?id=${i.id}&num=0`,
                            alignment: 'left',
                        }),
                        // Main text with double line break
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: i.text,
                                    break: 2,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        // Ensure directory exists
        fs.ensureDirSync(pth.dirname(filePath));

        // Convert document to buffer and save
        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(filePath, buffer);
    });
});
