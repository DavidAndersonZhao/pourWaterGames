const { ccclass, property } = cc._decorator;
import SetCom from "./setCom";

export enum AudioEnum {
    button = "audio/Button_Click",
    finishOne = "audio/ContainerFinish",
    pourWater = "audio/pourWater",
    youWin = "audio/Show_Victory",
}

export class UtilAudio {
    
    static beforeloadAll() {
        let arr = [];
        for (let key in AudioEnum) {
            let path = AudioEnum[key];
            arr.push(path)
        }
        cc.resources.preload(arr);
    }
    static removeloadAll() {
        for (let key in AudioEnum) {
            let path = AudioEnum[key];
            cc.resources.release(path, cc.AudioClip);
        }
    }

    static async effect_play(path: AudioEnum | string, volume = 1) {
        if (!SetCom.audioSet._musicPlay) return
        let clip = await this.loadAudioClip(path);
        return cc.audioEngine.play(clip, false, volume);
    }

    static async pourWater_effect_play(time: number) {
        if (!SetCom.audioSet._musicPlay) return
        let clip = await this.loadAudioClip(AudioEnum.pourWater);
        let id = cc.audioEngine.play(clip, false, 1.0);
        let dur = 3.0 * time;
        setTimeout(() => {
            cc.audioEngine.stop(id)
        }, dur * 1000);
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