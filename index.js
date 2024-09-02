const five = require("johnny-five")
const board = new five.Board()
const firmata = require("firmata")
const newfirmata = new firmata
//Imports

board.on("ready", () => { //When the board is ready.
    const gps = new five.GPS({pins: {rx: 11, tx: 10}}) //Declare a GPS system with RX as Pin 11 and TX as Pin 10
    const servo1 = new five.Servo({pin: 10, center: true}) //Declare a Servo at Pin 10 (??? Isn't it GPS TX?)
    const servo2 = new five.Servo({pin: 11, center: true}) //Declare a Servo at Pin 11 (Same as above, isn't it GPS RX?)
    const servo3 = new five.Servo({pin: 12, center: true}) //Declare a Servo at Pin 12
    const servo4 = new five.Servo({pin: 13, center: true}) //Declare a Servo at Pin 13 (bad choice, i'd go for lower row, pin 4-7 for all servos)
    newfirmata.serialConfig({ //Initialize Soft-Serial at Pin 4 and 7 (RX and TX in order)
        portId: SW_SERIAL0,
        baud: 9600,
        rxPin: 4,
        txPin: 7
    });

    gps.on("change", (position) => { //When the GPS detects a change in position.
        const {altitude, latitude, longitude} = position; //Declare the first three variables of "position" to alt, lat and long
        newfirmata.serialWrite(newfirmata.SERIAL_PORT_IDs.SW_SERIAL1,Buffer.from(JSON.stringify({ "latitude": latitude, "longitude": longitude, "altitude": altitude })))
        // Write alt, lat and long to Soft-Serial as JSON
    });
    gps.on("navigation", (velocity) => { //When the GPS detects a change in velocity.
        const {course, speed} = velocity; //Declare first two variables of "velocity" to course and speed
        newfirmata.serialWrite(newfirmata.SERIAL_PORT_IDs.SW_SERIAL1,Buffer.from(JSON.stringify({ "course": course, "speed": speed })))
        // Write course and speed to Soft-Serial as JSON
    });
    
    newfirmata.serialRead(newfirmata.SERIAL_PORT_IDs.SW_SERIAL0,0,(data) => { //TLDR get info and write to servos.
        if(new Buffer(data).toString().startsWith("1:")){
            let Kdata = new Buffer(data).replace(":1", "").toString().split("").toString().replace(/1/g, "").replace(/:/g, "").replace(/,/g, "")
            servo1.to(Kdata)
        }
        if(new Buffer(data).toString().startsWith("2:")){
            let Kdata = new Buffer(data).replace(":2", "").toString().split("").toString().replace(/1/g, "").replace(/:/g, "").replace(/,/g, "")
            servo2.to(Kdata)
        }
        if(new Buffer(data).toString().startsWith("3:")){
            let Kdata = new Buffer(data).replace(":3", "").toString().split("").toString().replace(/1/g, "").replace(/:/g, "").replace(/,/g, "")
            servo3.to(Kdata)
        }
        if(new Buffer(data).toString().startsWith("4:")){
            let Kdata = new Buffer(data).replace(":4", "").toString().split("").toString().replace(/1/g, "").replace(/:/g, "").replace(/,/g, "")
            servo4.to(Kdata)
        }
    })

})
