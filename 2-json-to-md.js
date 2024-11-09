const cheerio = require('cheerio');
const list = require('./data/output.json').list;

class JsonDB {
    dataFile = '';
    fs = require('fs');

    constructor(dataFile) {
        this.dataFile = dataFile;
    }

    reset() {
       this.fs.writeFileSync(this.dataFile, '');
    }

    appendText(str = '') {
       this.fs.writeFileSync(this.dataFile, str, {flag: 'a'});
    }
}

function toJSON(listData, fileName) {
    const db = new JsonDB(fileName);
    db.reset();
    listData.forEach(item => {
        let str = '';
    
        // 标题
        const title = item['标题'];
        str += `# ${title}\n`;

        // 附加信息
        const metaInfo = ['机构或省份', '来源'].reduce((acc, cur) => {
            const value = item[cur];
            if (value) {
                acc += `\n${cur}：${item[cur]}\n`;
            }
            return acc;
        }, '');
        str += metaInfo;
        str += '\n';
    
        // 正文
        const content = item.content;
        const $ = cheerio.load(content);
        const para = [...$('p').map((_, el) => {
            return $(el).text();
        })].join('\n\n');
        str += para;
        str += '\n\n';
        db.appendText(str);
    });
}

toJSON(list.filter(i => i.政策级别 === '国家'), './data/国家.md');
toJSON(list.filter(i => i.政策级别 === '地方'), './data/地方.md');
