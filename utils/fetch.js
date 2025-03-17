function getHeaders() {
    return {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        accesstoken: 'null',
        'content-type': 'application/json',
        'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
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

async function sleep(timeout = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

module.exports = {
    sleep,
    getHeaders,
};
