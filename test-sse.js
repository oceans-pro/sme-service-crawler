const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.vveai.com/v1/chat/completions';

async function streamChatCompletions(article) {
    const response = await axios.post(
        API_URL,
        
        {
            stream: true,
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
            responseType: 'stream',
        },
    );
    let summary = '';
    response.data.on('data', (chunk) => {
        // data: {"choices":[{"delta":{"content":"呀","role":"assistant"},"index":0}],"created":1742539275,"id":"0217425392756566b12a05d368817686c237b1e7e98253474107e","model":"doubao-1-5-lite-32k-250115","service_tier":"default","object":"chat.completion.chunk","usage":null}
        const chunkStr = chunk.toString();
        const lines = chunkStr.split('\n').filter(line => line.trim().startsWith('data: '));
        for (const line of lines) {
            const jsonStr = line.replace(/^data: /, '').trim();
            if (jsonStr === '[DONE]') continue;
            const chunkData = JSON.parse(jsonStr);
            if (chunkData?.choices?.[0]?.delta?.content) {
                summary += chunkData.choices[0].delta.content;
            }
        }
        console.log(summary);
    });
    response.data.on('end', () => {
        console.log('摘要生成完成');
    });
}

streamChatCompletions('a').then((summary) => { console.log(summary); }
).catch((error) => {
    console.error(error.message);
});