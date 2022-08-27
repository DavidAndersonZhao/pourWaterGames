class Power {
    date = new Date();
    time = 0;
    nextTime = 0;
    constructor() {

    }
    setTime() {
        this.time = this.date.getTime() / 1000;
    };
    getTime() {
        return this.time;
    };

    getNextTime() {

        this.nextTime = this.time + 600;
        return this.nextTime;
    };
}

var cg = {
    power: new Power()
};

export default cg;