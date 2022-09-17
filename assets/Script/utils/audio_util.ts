const { ccclass, property } = cc._decorator;
import { resourceUtil } from "./resourceUtil";
import SetCom from "./setCom";
import { lodash } from './lodash';
export enum AudioEnum {
    button = "Button_Click",
    finishOne = "ContainerFinish",
    pourWater = "pourWater",
    youWin = "Show_Victory",
    draw = "draw",
    modal = "modal",
}

export class UtilAudio {
    static audios: any = {};
    static arrSound: any = [];
    static soundVolume: number = 1;
    static beforeloadAll() {//没用TODO:
        let arr = [];
        for (let key in AudioEnum) {
            let path = AudioEnum[key];
            arr.push(path)
        }
        cc.resources.preload(arr);
    }
    static removeloadAll() {//没用TODO:
        for (let key in AudioEnum) {
            let path = AudioEnum[key];
            cc.resources.release(path, cc.AudioClip);
        }
    }
    /**
      * 播放音效
      * @param {String} name 音效名称可通过constants.AUDIO_SOUND 获取
      * @param {Boolean} loop 是否循环播放
      */
    static playSound(name: string, loop: boolean = false, volume = 1, time?: number) {
        if (!volume) {
            return;
        }

        //音效一般是多个的，不会只有一个
        let path = 'audio/';
        // if (name !== 'click') {
        //     path = path; //微信特殊处理，除一开场的音乐，其余的放在子包里头
        // }

        resourceUtil.loadRes(path + name, cc.AudioClip, (err: any, clip: cc.AudioClip) => {
            let tmp = {} as any;
            tmp.clip = clip;
            tmp.loop = loop;
            tmp.isMusic = false;
            this.arrSound.push(tmp);
            if (loop) {
                this.audios[name] = tmp;
            }
            let id = cc.audioEngine.play(clip, loop, volume)
            if (time) {
                setTimeout(() => {
                    cc.audioEngine.stop(id)
                }, time * 1000);
            }
            clip.once('ended', () => {
                lodash.remove(this.arrSound, (obj: any) => {
                    return obj.clip === tmp.clip;
                });
            })
        });

    }

    static async effect_play(path: AudioEnum | string, volume = 1) {
        if (!SetCom.audioSet._musicPlay) return
        return UtilAudio.playSound(path, false, volume);
    }

    static async pourWater_effect_play(time: number) {
        if (!SetCom.audioSet._musicPlay) return
        let dur = 3.0 * time;
        UtilAudio.playSound(AudioEnum.pourWater, false, 1.0, dur)
    }
    static async draw_play(time: number) {
        if (!SetCom.audioSet._musicPlay) return
        // let clip = await this.loadAudioClip('audio/' + AudioEnum.draw);
        // let id = cc.audioEngine.play(clip, false, 1.0);
        // debugger
        let dur = 3.0 * time;
        UtilAudio.playSound(AudioEnum.draw, false, 1.0, dur)

    }
    static async btnAudioClick() {
        if (!SetCom.audioSet._musicPlay) return
        UtilAudio.playSound(AudioEnum.button)
    }
    static async modalAudioClick() {
        if (!SetCom.audioSet._musicPlay) return
        UtilAudio.playSound(AudioEnum.modal)
    }
    private static async loadAudioClip(path: string) {
        return new Promise<cc.AudioClip>(function (resove, reject) {
            cc.resources.load(path, cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
                if (err) {
                    resove(null)
                } else {
                    resove(clip)
                }
            })
        })
    }
}