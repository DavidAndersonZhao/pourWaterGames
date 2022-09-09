/**
* Copyright (c) 2020—2020 虚咖科技  All rights reserved.
* Autor: Created by 李清风 on 2020-11-17.
* Desc: 
@exg Design：
@exp Use Cases：
@exg Tag Fixed：
*/
export const task = {
    name: '【任务引导流程】',
    debug: true,
    steps: [
        {
            order: 0,  //数组索引为0
            name: 'GuideTask',
            command: {
                cmd: 'movefinger',
                text: '请选中这个试管',
                args: 'bg/bgImg/cupMgr/layout_v/layout_h_0/cup',
                index:0
            },
            delayTime: 0.1,
            onStart(callback) {
                callback();
            },
            onExcute(callback) {
                callback();
            },
            onEnd(callback) {
                callback();
            }
        },
        {
            order: 1,
            name: 'GuideBag',
            command: {
                cmd: 'movefinger',
                text: '将相同颜色的水，倒满同一个试管中则过关',
                args: 'bg/bgImg/cupMgr/layout_v/layout_h_0/cup,cup',
                index:1
            },
            delayTime: 0.2,
            onStart(callback) {
                callback();
            },
            onExcute(callback) {
                callback();
            },
            onEnd(callback) {
                callback();
            }
        }
    ]
}