/**
 * @file 营商环境爬虫
 * @url https://www.sme-service.cn/#/initialArticle
 */

const {
    getApplicationTypeList,
    getPolicyTypeList,
    getProvinceCityCodeList,
    getProvinceCodeList,
    getGovCodeList,
} = require('./utils/config');
const { getHeaders } = require('./utils/fetch');
const { countKeywordInString } = require('./utils/proc');

class JsonDB {
    dataFile = './data/rawData.json';
    fs = require('fs');

    constructor(
        { reset } = {
            reset: false,
        },
    ) {
        if (reset) {
            this.reset();
        }
    }

    reset() {
        this.fs.writeFileSync(
            this.dataFile,
            JSON.stringify(
                {
                    list: [],
                },
                null,
                4,
            ),
        );
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

async function fetchOnePage(
    currentPage = 1,
    {
        queryYear = undefined,
        subject = '',
        // 1005为国家级别
        publishUnitFilter = '',
    },
) {
    const pagesize = 8;
    const res = await fetch(
        `https://www.sme-service.cn/zzf/1/policy/findList?pagesize=${pagesize}&currentPage=${currentPage}&from=0`,
        {
            headers: getHeaders(),
            body: JSON.stringify({
                pAnalyseState: '',
                pArticleState: '',
                applicationType: '',
                queryYear: '',
                orderBy: 'PUBLISH_TIME',
                policyState: 1,
                userId: '',
                delFlag: 0,
                subject,
                publishUnitFilter,
                queryYear,
            }),
            method: 'POST',
        },
    );
    const data = (await res.json()).data;
    const list = data.list || [];
    const pageNums = Math.ceil(data.total / data.pageSize);
    if (pageNums === 101) {
        console.log(data);
    }
    return [list, pageNums];
}

(async () => {
    let currentPage = 1;
    let pageNums = 1;
    const db = new JsonDB({ reset: true });
    while (currentPage <= pageNums) {
        const [list, lastPage] = await fetchOnePage(currentPage, {
            publishUnitFilter: '1005',
        });
        console.info(`完成爬取: ${currentPage} / ${pageNums} 页.`)
        if (Array.isArray(list)) {
            list.forEach(item => {
                db.saveItem(item);
            });
        }
        pageNums = lastPage;
        currentPage++;
    }
})();

// function procItem(item) {
//     // console.log({ item })
//     const db = new JsonDB({ reset: true });
//     const result = [];
//     list.forEach((item, idx) => {
//         const {
//             title,
//             content,
//             applyUrl,
//             id,
//             subject,
//             publishTime,
//             applicationType,
//             source,
//             publishUnit, // 大类
//             publishUnit2, // 二级类，省份国家单位
//             publishUnit3, // 三级类，城市单位，不重要了，不需要精确到这一级别
//         } = item || {};

//         const 政策主题 = getPolicyTypeList().find((i) => String(i.itemCode) === String(subject))?.itemName || '';
//         const 应用类型 =
//             getApplicationTypeList().find((i) => String(i.itemCode) === String(applicationType))?.itemName || '';
//         const 发布时间 = (publishTime || '').split(' ')[0];
//         result.push({
//             标题: title,
//             发布时间,
//             链接: `https://www.sme-service.cn/#/detail?id=${id}&num=0`,
//             原始链接: applyUrl || '',
//             政策主题,
//             应用类型,
//             政策级别,
//             机构或省份,
//             来源: source,
//             id,
//             content,
//         });
//     });
// }
