/**
 * @fileOverview
 */
const SerialPort = require('serialport/test');
const MockBindingBase = SerialPort.Binding;


function createTestPort(info, opt) {
    const options = Object.assign({
        echo: false,
        record: false,
        readyData: Buffer.from('READY')
    }, opt);

    return {
        // data: Buffer.alloc(0),
        // echo: options.echo,
        // record: options.record,
        // readyData: Buffer.from(options.readyData),
        info
    };
}

/**
 *
 * @const
 */
const testSerialPorts = [
    createTestPort({
        "comName": "/dev/tty.Bluetooth-Incoming-Port",
        "locationId": undefined,
        "manufacturer": undefined,
        "pnpId": undefined,
        "productId": undefined,
        "serialNumber": undefined,
        "vendorId": undefined
    }),
    createTestPort({
        "comName": "/dev/tty.fx24024-01-Bluetooth-In",
        "locationId": undefined,
        "manufacturer": undefined,
        "pnpId": undefined,
        "productId": undefined,
        "serialNumber": undefined,
        "vendorId": undefined
    }),
    createTestPort({
        "comName": "/dev/tty.usbserial-HOGECHUN",
        "locationId": "14100000",
        "manufacturer": "MONOWIRELESS",
        "pnpId": undefined,
        "productId": "6001",
        "serialNumber": "MW1IVY5M",
        "vendorId": "0403"
    })
];

/**
 * @class
 */
class MockBinding extends MockBindingBase {
    static list() {
        const infoList = testSerialPorts.map(p => p.info);
        return Promise.resolve(infoList);
    }

    open(path, opt) {
        if (!path) {
            throw new TypeError('"path" is not a valid port');
        }

        if (typeof opt !== 'object') {
            throw new TypeError('"options" is not an object');
        }

        if (this.isOpen) {
            return Promise.reject(new Error('Already open'));
        }
        const port = this.port = testSerialPorts.find(port => port.info.comName === path);

        return Promise.resolve()
            .then(() => {
                if (!port) {
                    return Promise.reject(new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`));
                }
                this.serialNumber = port.info.serialNumber;

                if (this.openOpt && this.openOpt.lock) {
                    return Promise.reject(new Error('Port is locked cannot open'));
                }

                if (this.isOpen) {
                    return Promise.reject(new Error('Open: binding is already open'));
                }

                this.openOpt = Object.assign({}, opt);
                this.isOpen = true;
            });
    }

    close() {
        const port = this.port;
        if (!port) {
            return Promise.reject(new Error('already closed'));
        }

        return super.close()
            .then(() => {
                delete port.openOpt;
                port.data = Buffer.alloc(0);
                delete this.port;
                delete this.serialNumber;
                this.isOpen = false;
                if (this.pendingRead) {
                    this.pendingRead(new Error('port is closed'));
                }
            });
    }

}

SerialPort.Binding = MockBinding;

module.exports = SerialPort;
