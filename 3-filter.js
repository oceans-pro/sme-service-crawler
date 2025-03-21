const fs = require('fs');
const cheerio = require('cheerio');


const json = require('./data/rawData.json');
const { countKeywordInString } = require('./utils/proc');
const { getGovCodeList } = require('./utils/config');
console.log('Start processing data...');

const classKeyword = ['普惠金融', '科技金融', '民营'];

const procItemMapper = (item) => {
    const result = {
        keywords: [],
    };

    result.id = item.id;

    // subject
    if (item.subject === '10570016') {
        result.subjectName = '综合类';
    } else if (item.subject === '10570003') {
        result.subjectName = '投融资';
    } else {
        result.subjectName = '专项支持';
    }

    // unit
    if (item.publishUnit2) {
        const unit = getGovCodeList(item.publishUnit2.split(',')[0]);
        result.unit = unit;
    }
    if (!result.unit) {
        result.unit = item.source;
    }

    // html
    const html = item.content;
    const $ = cheerio.load(html);
    const para = [
        ...$('p').map((_, el) => {
            return $(el).text();
        }),
    ].join('\n\n');

    if (countKeywordInString(para,'普惠金融') >= 1) {
        result.keywords.push('普惠金融');
    }
    if (countKeywordInString(para,'科技金融') >= 1 || (countKeywordInString(para,'专精特新') >= 1 && countKeywordInString(para, '融资') >= 1)) {
        result.keywords.push('科技金融');
    }
    if (countKeywordInString(para,'民营') >= 1) {
        result.keywords.push('民营经济');
    }

    if (item.publishTime) {
        result.publishTime = item.publishTime.split(' ')[0];
    }
    result.text = para;
    result.title = item.title;
    result.url = item.url;
    result.publishNo = item.publishNo;
    return result;
};

const mapped = json.list.map(procItemMapper).filter((i) => i.keywords.length > 0);

fs.writeFileSync('./data/filter.json', JSON.stringify(mapped, null, 4));
