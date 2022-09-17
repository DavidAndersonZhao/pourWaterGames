const { _decorator, resources, error } = cc
const { ccclass } = _decorator;

@ccclass("resourceUtil")
export class resourceUtil {
    /**
 * 加载资源
 * @param url   资源路径
 * @param type  资源类型
 * @param cb    回调
 * @method loadRes
 */
    public static loadRes(url: string, type: any, cb: Function = () => { }) {
        resources.load(url, (err: any, res: any) => {
            if (err) {
                error(err.message || err);
                cb(err, res);
                return;
            }

            cb && cb(null, res);
        })
    }


}
