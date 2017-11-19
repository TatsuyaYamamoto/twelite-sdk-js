const SerialPort = require('serialport');
const TweliteCommand = require('./command/TweliteCommand');

/**
 *
 * @type {Object}
 * @const
 */
const serialPortDefaultSettings = Object.freeze({
    autoOpen: false,
    baudRate: 115200,
    dataBits: 8,
    hupcl: true,
    lock: true,
    parity: 'none',
    rtscts: false,
    stopBits: 1,
    xany: false,
    xoff: false,
    xon: false,
    highWaterMark: 64 * 1024
});

/**
 * TWELITE DIPとシリアル通信をを行うクラス
 *
 * @example
 * ```js
 *
 * ```
 *
 * @class
 */
class Twelite {
    /**
     * {@param comName}に対するシリアル接続を行うインスタンスを作成する。
     *
     * @param comName 接続を行うシリアル接続のシステムパス。
     * @param serialPortSettings ポート設定
     * @see SerialPort
     * @see serialPortDefaultSettings
     * @constructor
     */
    constructor(comName, serialPortSettings) {

        const settings = Object.assign({}, serialPortDefaultSettings, serialPortSettings);
        this._serialPort = new SerialPort(comName, settings);
    }

    /**
     * 接続がopen状態の場合、trueを返却する。
     *
     * @return {boolean}
     * @readonly
     */
    get isOpen() {
        return this._serialPort.isOpen;
    };

    /**
     * Tweliteが返却する有効なシリアルポートに関するメタデータの型
     *
     * @typedef {object} SerialPortMetaData
     * @param comName{string}
     * @param manufacturer{string}
     * @param serialNumber{string}
     * @param pnpId{string}
     * @param locationId{string}
     * @param vendorId{string}
     * @param productId{string}
     * @see SerialPort#list
     */
    /**
     * 'MONOWIRELESS'が製造元の有効なシリアル接続のメタデータを返却する。
     *
     * @param anyManufacturer {boolean} trueの場合、呼び出し元に接続されている全てのシリアル接続のメタデータを返却する
     * @return {Promise.<SerialPortMetaData>}
     * @see SerialPort#list
     * @static
     */
    static serialPorts(anyManufacturer = false) {
        return SerialPort.list()
            .then((ports) => {
                return anyManufacturer ?
                    ports :
                    ports.filter(p => p.manufacturer === 'MONOWIRELESS');
            })
    }

    /**
     * 設定されたパス{@link Twelite#constructor}に対して、シリアル接続を開始する
     *
     * @return {Promise.<undefined>}
     * @see SerialPort#open
     */
    open() {
        return this._openWithPromise();
    }

    /**
     * シリアル接続を終了する。
     *
     * @return {Promise.<undefined>}
     * @see SerialPort#close
     */
    close() {
        return this._closeWithPromise();
    }

    /**
     * 接続されたシリアル接続先にデータを書き込む。
     *
     * @param data {(TweliteCommand|string|array|buffer)}
     * @return {Promise.<string>}
     * @see SerialPort#write
     */
    write(data) {
        const writingData = data instanceof TweliteCommand ?
            data.build() :
            data;

        return this._writeWithPromise(writingData);
    }

    /**
     * TODO: Write doc
     * @see https://www.npmjs.com/package/serialport#module_serialport--SerialPort+event_open
     * @see https://www.npmjs.com/package/serialport#module_serialport--SerialPort+event_close
     * @see https://www.npmjs.com/package/serialport#module_serialport--SerialPort+event_data
     * @see https://www.npmjs.com/package/serialport#module_serialport--SerialPort+event_error
     */
    on(type, listener) {
        this._serialPort.on(type, listener);
    }

    /**
     * Promiseを返却する{@link SerialPort#open}のラッパー
     *
     * @return {Promise}
     * @private
     */
    _openWithPromise() {
        return new Promise((onFulfilled, onRejected) => {
            this._serialPort.open(function (err) {
                if (err) {
                    onRejected(err);
                } else {
                    onFulfilled();
                }
            });
        })
    }

    /**
     * Promiseを返却する{@link SerialPort#close}のラッパー
     *
     * @return {Promise}
     * @private
     */
    _closeWithPromise() {
        return new Promise((onFulfilled, onRejected) => {
            this._serialPort.close(function (err) {
                if (err) {
                    onRejected(err);
                } else {
                    onFulfilled();
                }
            });
        })
    }

    /**
     * Promiseを返却する{@link SerialPort#write}のラッパー
     *
     * @return {Promise.<string>}
     * @private
     */
    _writeWithPromise(data) {
        return new Promise((onFulfilled, onRejected) => {
            this._serialPort.write(data, 'utf8', function (err) {
                if (err) {
                    onRejected(err);
                } else {
                    onFulfilled(data);
                }
            });
        })
    }
}

module.exports = Twelite;