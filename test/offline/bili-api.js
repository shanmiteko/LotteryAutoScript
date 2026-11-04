const assert = require('assert');
const http = require('../../lib/net/http');
const requests = [];
let responses = [];
http.send = request => {
    requests.push(request);
    const response = responses.shift();
    assert.notStrictEqual(response, undefined, 'unexpected request');
    if (typeof response === 'string') request.failure(response);
    else request.success({ body: JSON.stringify(response) });
};
const globals = require('../../lib/data/global_var');
const config = require('../../lib/data/config');
const bili = require('../../lib/net/bili');
const { Monitor } = require('../../lib/core/monitor');
const eventBus = require('../../lib/helper/event_bus');
globals.set('cookie', 'SESSDATA=test');
globals.set('csrf', 'csrf-test');
globals.set('myUID', 123);
config.get_partition_wait = 0;

function setup(...values) {
    requests.length = 0;
    responses = values;
}
const page = (ids, total) => ({ code: 0, data: { total, list: ids.map(mid => ({ mid })) } });

(async () => {
    setup(page([12, 123], 3), page([456], 3));
    assert.strictEqual(await bili.getAttentionList(123), '12,123,456');
    assert.strictEqual(requests.length, 2);
    assert.deepStrictEqual(requests.map(r => r.query), [
        { vmid: 123, pn: 1, ps: 50 }, { vmid: 123, pn: 2, ps: 50 }
    ]);
    assert.strictEqual(requests[0].headers.referer, 'https://www.bilibili.com/');
    setup(page([], 0));
    assert.strictEqual(await bili.getAttentionList(123), '');
    for (const second of [{ code: -352, message: 'blocked' }, page([], 2), page([1], 2), '[响应错误]HTTP状态码: 404']) {
        setup(page([1], 2), second);
        assert.strictEqual(await bili.getAttentionList(123), null);
    }
    setup({ code: 0, data: {} });
    assert.strictEqual(await bili.getAttentionList(123), null);

    setup({ code: 0, data: { result: 0 } });
    const text = '😀转发@小明 #话题#@好友';
    const ctrl = JSON.stringify([
        { type: 1, location: 4, length: 3, data: '123' },
        { type: 1, location: 12, length: 3, data: '456' }
    ]);
    assert.strictEqual(await bili.autoRelay(123, '1244325070220820481', text, ctrl), 0);
    const r = requests[0];
    assert.strictEqual(r.url, 'https://api.bilibili.com/x/dynamic/feed/create/dyn');
    assert.strictEqual(r.headers['content-type'], 'application/json');
    assert.deepStrictEqual(r.query, { csrf: 'csrf-test', platform: 'web' });
    assert.strictEqual(r.config.retry, false);
    assert.strictEqual(r.contents.web_repost_src.dyn_id_str, '1244325070220820481');
    assert.deepStrictEqual(r.contents.dyn_req.content.contents, [
        { raw_text: '😀转发', type: 1, biz_id: '' },
        { raw_text: '@小明', type: 2, biz_id: '123' },
        { raw_text: ' #话题#', type: 1, biz_id: '' },
        { raw_text: '@好友', type: 2, biz_id: '456' }
    ]);
    setup({ code: 0 });
    assert.strictEqual(await bili.autoRelay(123, '99', 'a'.repeat(230) + '@好友啊', JSON.stringify([{ type: 1, location: 230, length: 4, data: '1' }])), 0);
    assert.strictEqual(requests[0].contents.dyn_req.content.contents[0].raw_text.length, 230);
    setup({ code: 0 });
    assert.strictEqual(await bili.autoRelay(123, '99', 'a'.repeat(232) + '😀', '[]'), 0);
    assert.strictEqual(requests[0].contents.dyn_req.content.contents[0].raw_text.length, 232);
    setup();
    assert.strictEqual(await bili.autoRelay(123, '99', 'hello', '[bad'), 1);
    assert.strictEqual(requests.length, 0);
    for (const [response, expected] of [[{ code: 1101004 }, 2], [{ code: 2201116 }, 3], [{ code: 1101008 }, 4], [{ code: 4126117 }, 5], [{ code: 0, data: { result: 1 } }, 1], ['HTTP 404', 1]]) {
        setup(response);
        assert.strictEqual(await bili.autoRelay(123, '99'), expected);
    }

    setup({ code: 0, data: {} });
    assert.strictEqual(await bili.sendChat('1244325070220820481', '测试', 17), 0);
    assert.strictEqual(requests[0].url, 'https://api.bilibili.com/x/v2/reply/add');
    assert.strictEqual(requests[0].config.retry, false);
    assert.strictEqual(requests[0].contents.oid, '1244325070220820481');
    assert.strictEqual(requests[0].contents.csrf, 'csrf-test');
    assert.match(requests[0].headers['content-type'], /application\/x-www-form-urlencoded/);
    for (const response of [{ code: 12002 }, { code: 12052 }]) {
        setup(response);
        assert.strictEqual(await bili.sendChat('1', '测试', 17), 3);
    }
    setup({ code: 12015 });
    assert.strictEqual(await bili.sendChat('1', '测试', 17), 4);
    setup({ code: 0, data: { need_captcha: true, url: 'https://example.com/captcha' } });
    delete process.env.ENABLE_CHAT_CAPTCHA_OCR;
    assert.strictEqual(await bili.sendChatWithOcr('1', '测试', 17), 4);
    setup('HTTP 404');
    assert.strictEqual(await bili.sendChat('1', '测试', 17), 1);

    const originalGetAttentionList = bili.getAttentionList;
    const originalEmit = eventBus.emit;
    const events = [];
    eventBus.emit = (...args) => events.push(args);
    config.model = '11';
    config.is_not_create_partition = true;
    const monitor = new Monitor(['UIDs', 1]);
    let started = false;
    monitor.startLottery = async () => { started = true; return 0; };
    bili.getAttentionList = async () => null;
    await monitor.init();
    assert.strictEqual(started, false);
    assert.deepStrictEqual(events[0], ['Turn_off_the_Monitor', '关注列表获取失败']);
    bili.getAttentionList = async () => '123,456';
    await monitor.init();
    assert.strictEqual(started, true);
    assert.strictEqual(monitor.attentionList.has('123'), true);
    assert.strictEqual(monitor.attentionList.has('12'), false);
    bili.getAttentionList = originalGetAttentionList;
    eventBus.emit = originalEmit;
    console.log('offline Bilibili API tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
