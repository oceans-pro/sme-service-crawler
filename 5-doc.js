const fs = require('fs-extra');
const pth = require('path');
const { Document, Paragraph, TextRun, HeadingLevel, Packer } = require('docx');

const json = require('./data/filter.json');

json.forEach((i) => {
    i.keywords.forEach(async (kw) => {
        const dir = pth.join(__dirname, './word/' + kw + '/' + i.unit + '/' + i.subjectName);
        const fileName = i.title.trim().replaceAll(' ', '') + '.docx';
        const filePath = pth.join(dir, fileName);
        i.text = i.text.replaceAll('㐀', '');
        i.text = i.text.replace(/\n+/g, '\n');
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
                                    bold: true, // 可选:设置为粗体
                                }),
                            ],
                        }),
                        // Empty paragraph for spacing
                        new Paragraph({
                            text: '',
                            spacing: {
                                after: 400,
                            },
                        }),
                        // Main text split into paragraphs
                        ...i.text.split('\n').map((line) => {
                            line = line.replace(/\s+/g, ' ')
                            let currentPos = 0;
                            const lineResults = [];
                            
                            // 查找每个关键词
                            i.keywords.forEach(kw => {
                                let pos = line.indexOf(kw, currentPos);
                                while (pos !== -1) {
                                    // 添加关键词前的普通文本
                                    if (pos > currentPos) {
                                        lineResults.push(
                                            new TextRun({
                                                text: line.slice(currentPos, pos),
                                                font: 'SimSun'
                                            })
                                        );
                                    }
                                    // 添加高亮的关键词
                                    lineResults.push(
                                        new TextRun({
                                            text: kw,
                                            // color: '#ffff00', // 红色
                                            // shading: {
                                            //     fill: '#ffff00', // 黄色
                                            // },
                                            font: 'SimSun'
                                        })
                                    );
                                    currentPos = pos + kw.length;
                                    pos = line.indexOf(kw, currentPos);
                                }
                            });
                            
                            // 添加剩余的文本
                            if (currentPos < line.length) {
                                lineResults.push(
                                    new TextRun({
                                        text: line.slice(currentPos),
                                        font: 'SimSun'
                                    })
                                );
                            }
                            
                            // 返回一个新的段落
                            return new Paragraph({
                                children: lineResults,
                                spacing: {
                                    after: 50, // 段落间距
                                    line: 360, // 1.5倍行距 (240 * 1.5)
                                    lineRule: 'exact'
                                },
                                indent: {
                                    firstLine: 480 // 首行缩进2个中文字符 (约240 * 2)
                                }
                            });
                        }),
                        // Year as normal paragraph
                        // new Paragraph({
                        //     text: '发布时间: ' + i.publishTime,
                        //     alignment: 'left',
                        // }),
                        // URL paragraph
                        // new Paragraph({
                        //     text: `链接: https://www.sme-service.cn/#/detail?id=${i.id}&num=0`,
                        //     alignment: 'left',
                        // }),
                        // new Paragraph({
                        //     text: `原始链接: ${i.url || '暂无'}`,
                        //     alignment: 'left',
                        // }),
                    ].filter(Boolean),
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
