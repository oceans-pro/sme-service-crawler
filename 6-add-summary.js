const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const filterData = require('./data/filter.json');

// 大模型 API 配置
const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.vveai.com/v1/chat/completions'; // 以 OpenAI API 为例

/**
 * 生成文章摘要
 * @param {string} article - 需要摘要的文章内容
 * @returns {Promise<string>} - 返回摘要内容
 */
async function generateSummary(article) {
    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'doubao-1-5-lite-32k', // 可以根据需要选择不同的模型
                messages: [
                    {
                        role: 'system',
                        content:
                            '你是一个专业的文章摘要工具。请将提供的文章内容。字数要求: 总结为大约150字左右的摘要，保留文章的核心观点和重要信息；格式要求: 只要普通文本，不要使用任何markdown语法。',
                    },
                    {
                        role: 'user',
                        content: article,
                    },
                ],
                max_tokens: 300, // 控制返回的摘要长度
                temperature: 0.5, // 控制创造性，越低越保守
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                },
            },
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('摘要生成失败:', error.response?.data || error.message);
        throw new Error('摘要生成失败');
    }
}

// 示例使用
async function main() {
    // 示例文章，实际使用时可以从文件读取或通过API获取
    // const sampleArticle = `这里是一篇长文章的内容......`;
    const sampleArticle = fs.readFileSync('article.txt', 'utf-8');
    
    try {
        const summary = await generateSummary(sampleArticle);
        console.log('文章摘要:');
        console.log(summary);
    } catch (error) {
        console.error(error.message);
    }
}

// if (require.main === module) {
//     main();
// }


function save(data) {
    fs.writeFileSync('data/filter-with-summary.json', JSON.stringify(data, null, 4));
}

function read() {
    const data = fs.readFileSync('data/filter-with-summary.json', 'utf-8');
    return JSON.parse(data);
}


async function sum() {
    // fs.writeFileSync('data/filter-with-summary.json', JSON.stringify(filterData, null, 4));
    const json = read();
    for (const item of json) {
        const content = `标题：${item.title}\n正文：${item.text}`;
        if (item.summary?.length > 30) {
            console.log(`Summary already exists for: ${item.title}`);
            continue;
        }
        try {
            console.log(`Proced/Total: ${json.filter(i => i.summary?.length > 30).length} / ${json.length}`);
            const summary = await generateSummary(content);
            item.summary = summary;
            console.log(`Generated summary for: ${item.title}`);
        } catch (error) {
            console.error(`Failed to generate summary for: ${item.title}`);
            item.summary = '';
        } finally {
            save(json);
        }
    }
}

sum();
