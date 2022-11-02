
export function timeConversion(time: number) {
    let hours = ~~(time / 60 / 60)
    let minute = ~~((time - 60 * 60 * hours)/60)
    let second = time - minute * 60 - 60 * 60 * hours
    return {
        hours: hours >= 10 ? hours : '0' + hours,
        minute: minute >= 10 ? minute : '0' + minute,
        second: second >= 10 ? second : '0' + second
    }
}