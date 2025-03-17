function countKeywordInString(str = '', keyword = '') {
    let count = 0;
    let index = str.indexOf(keyword);
    while (index !== -1) {
        count++;
        index = str.indexOf(keyword, index + 1);
    }
    return count;
}

function filterKeyword(list = [], { keyword, minCount }) {
    return list.filter((item) => {
        return (
            item.content && item.content.includes(keyword) && countKeywordInString(item.content, keyword) >= minCount
        );
    });
}

module.exports = {
    countKeywordInString,
    filterKeyword,
};
