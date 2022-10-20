
export function timeConversion(time: number) {
    let minute = ~~(time / 60)
    let second = time - minute * 60
    return {
        minute: minute >= 10 ? minute : '0' + minute,
        second: second >= 10 ? second : '0' + second
    }
}