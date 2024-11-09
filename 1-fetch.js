/**
 * @file 营商环境爬虫
 * @url https://www.sme-service.cn/#/initialArticle
 */

const {
    getApplicationTypeList,
    getPolicyTypeList,
    getProvinceCityCodeList,
    getProvinceCodeList,
    getGovCodeList
} = require('./utils/config');

class JsonDB {
     dataFile = './data/output.json';
     fs = require('fs');

     constructor({
        reset,
     } = {
        reset: false
     }) {
        if (reset) {
            this.reset();
        }
     }

     reset() {
        this.fs.writeFileSync(this.dataFile, JSON.stringify({
            list: []
        }, null, 4));
     }

     getData() {
        const str = this.fs.readFileSync(this.dataFile).toString();
        const json = JSON.parse(str);
        return json;
     }

     saveItem(item) {
        const data = this.getData();
        data.list.push(item);
        this.fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 4));
     }
}

async function sleep(timeout = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
async function fetchOnePage(page = 1, {subject, keywordNum, keyword = ''}) {
    const pagesize = 8;
    const res = await fetch(
        `https://www.sme-service.cn/zzf/1/policy/findList?pagesize=${pagesize}&currentPage=${page}&from=0`,
        {
            headers: getHeaders(),
            body: JSON.stringify({
                pAnalyseState: '',
                pArticleState: '',
                applicationType: '',
                subject,
                queryYear: '',
                orderBy: 'PUBLISH_TIME',
                policyState: 1,
                userId: '',
                delFlag: 0,
            }),
            method: 'POST',
        }
    );
    const data = (await res.json()).data;
    const list = data.list || [];
    let matchedList = [];
    if (keyword && keywordNum) {
        matchedList = list.filter(item => {
            return item.content && item.content.includes(keyword) && countKeywordInString(item.content, keyword) >= num;
        });    
    } else if (subject) {
        matchedList = list;
    }
    
    console.info(`爬取第 ${page}/${data.pages} 页成功, ` + `符合条件的的文章有 ${matchedList.length} 个。`);
    const result = [];
    matchedList.forEach((item, idx) => {
        const {
            title,
            content,
            applyUrl,
            id,
            subject,
            publishTime,
            applicationType,
            source,
            publishUnit, // 大类
            publishUnit2, // 二级类，省份国家单位
            publishUnit3, // 三级类，城市单位，不重要了，不需要精确到这一级别
        } = item || {};

        const 政策主题 = getPolicyTypeList().find(i => String(i.itemCode) === String(subject))?.itemName || '';
        const 应用类型 = getApplicationTypeList().find(i => String(i.itemCode) === String(applicationType))?.itemName || '';
        let 政策级别 = '';
        if (publishUnit === '1005') {
            政策级别 = '国家'
        } 
        if (publishUnit === '1006') {
            政策级别 = '地方'
        }
        let 机构或省份 = '';
        let 城市 = '';
        if (政策级别 === '国家') {
            机构或省份 = getGovCodeList(publishUnit2)
        }
        if (政策级别 === '地方') {
            const [省份, city] = getProvinceCityCodeList({
                provinceCode: publishUnit2,
                cityCode: publishUnit3,
            });
            机构或省份 = 省份;
            城市 = city;
        }
        const 发布时间 = (publishTime || '').split(' ')[0];
        result.push({
            标题: title,
            发布时间,
            链接: `https://www.sme-service.cn/#/detail?id=${id}&num=0`,
            原始链接: applyUrl || '',
            政策主题,
            应用类型,
            政策级别,
            机构或省份,
            // 城市,
            来源: source,
            id,
            content,
        });
    });
    return result;
}

function getHeaders() {
    return {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        accesstoken: 'null',
        'content-type': 'application/json',
        'sec-ch-ua':
            '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        cookie: 'wzws_sessionid=gDEyMC4yNDQuMTQxLjE5MoI3OTVhZDCgZwf5P4EwOTk5M2E=; route=1728575807.931.155.280804; Hm_lvt_5367338aa3b77fca1c0c271d36c888e0=1728575808; HMACCOUNT=C646D32FF074BB55; Hm_lpvt_5367338aa3b77fca1c0c271d36c888e0=1728578002; SECKEY_ABVK=pPV0qO5RIjY1sa+RT8WI+nk2tSCkluH+mMOTmaGUXJo%3D; BMAP_SECKEY=pPV0qO5RIjY1sa-RT8WI-qUtdM0Fscy1g3AeDp_ZpyMOdrqYF_Gc_iz0b0C5z8_ytGJgaKAR12X60AyAybc2pCcaxnpi2sH0DD9n3sobz0PqN7VdngRy-dUVMDPR2Lc6IYBLy5O4xCiDfu80wLtAf7hxVPLNKxJl3fhHxz392II7a69iJTn7f8NRHjyYZsT7',
        Referer: 'https://www.sme-service.cn/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
}

function countKeywordInString(str = '', keyword = '') {
    let count = 0;
    let index = str.indexOf(keyword);
    while (index !== -1) {
        count++;
        index = str.indexOf(keyword, index + 1);
    }
    return count;
}

(async () => {
    const startPage = 1;
    // 这个页数目前先通过网站看
    const pageSize = 1180;
    const db = new JsonDB({reset: true});

    for(let i = startPage; i <= pageSize; i++) {
        const list = await fetchOnePage(i, {
            subject: "10570014"
        });
        for (const item of list) {
            // delete item.content
            delete item.id;
            db.saveItem(item);
        }
        // await sleep(Math.random() * 300);
    }
})();
