const TweliteCommand = require('./TweliteCommand');


/**
 * 相手端末の出力コントロールするUARTコマンド。
 * データフォーマットは以下の形式に従う。
 *  1: 1バイト : 宛先アドレス
 *  2: 1バイト : コマンド番号
 *  3: 1バイト : 書式バージョン
 *  4: 1バイト : IO状態
 *  5: 1バイト : IO状態設定マスク
 *  6,7,8,9: 各2バイト:  PWM1-4の設定値0%-100%, または設定しない。
 *  10:1バイト : チェックサム
 *
 * @see https://mono-wireless.com/jp/products/TWE-APPS/App_Twelite/step3-80.html
 * @class
 * @extends TweliteCommand
 */
class ChangeOutputCommand extends TweliteCommand{
    /**
     *
     * @param addressId
     * @constructor
     */
    constructor(addressId) {
        super(addressId);

        this._command = 0x80;
        this._digital = [-1, -1, -1, -1];
        this._analog = [-1, -1, -1, -1];
    }

    /**
     * コマンド番号 (0x80 固定)
     *
     * @type {number}
     * @readonly
     */
    get command(){
        return this._command;
    }

    /**
     * DO1/DO2/DO3/DO4の設定値。number型の配列にそれぞれの値が格納される。
     *
     * 値は0がHi(制御対象にしてオンにする)、1がLo(制御対象にしてオフにする)、-1が(制御対象にしない)。
     * 上記以外の値の場合、
     * -1未満の値は-1
     * 2以上の値は、偶数は0として、機数は1
     * 小数値は、小数部が切り捨て
     * として評価し、{@link this#build()}にて規定されたデーターフォーマットに変換される。
     *
     * @return {number[]}
     */
    get digital(){
        return this._digital;
    }

    /** @param {number[]} digital */
    set digital(digital){
        if(!Array.isArray(digital) || digital.length !== 4){
            console.error('Digital of twelite change output command should be array and have 4 numbers.');
            return;
        }

        this._digital = digital;
    }

    /**
     * PWM1/PWM2/PWM3/PWM4の設定値。number型の配列にそれぞれの値が格納される。
     *
     * 値は0-100の整数値であり、それ以外の場合は制御対象にしない、として評価する。
     * 設定しない(0%)～1024(100%)または0xFFFF(設定しない)を与えます。
     *
     * @return {number[]}
     */
    get analog(){
        return this._analog;
    }

    /** @param {number[]} analog */
    set analog(analog){
        if(!Array.isArray(analog) || analog.length !== 4){
            console.error('Analog of twelite change output command should be array and have 4 numbers.');
            return;
        }

        this._analog = analog;
    }

    /**
     * TWELITEが規定したデータフォーマットに従う、シリアル通信するための文字列を構築する。
     *
     * @return {string}
     */
    build(){
        const digitalOutputs = this._convertDigital(this.digital);
        const pwmOutputs = [];
        this.analog.forEach((a) => pwmOutputs.push(...this._convertAnalog(a)));

        const data = [];
        data.push(this.addressId);
        data.push(this.command);
        data.push(this.protocolVersion);
        data.push(...digitalOutputs);
        data.push(...pwmOutputs);
        data.push(this._calculateCheckSum(data));

        const hexString = data.map(d => this._convertToHex(d).toUpperCase()).join('');

        return `${this.startBit}${hexString}${this.stopBit}`;
    }

    /**
     * DOとして入力されたnumber型の配列をTWELITEが規定するIO値とそのビットマスク値の配列に変換する。
     *
     * @param digitalSignals {number[]} DO1-4の入力値の配列
     * @return {number[]}               変換されたIOとビットマスクの配列
     * @private
     */
    _convertDigital(digitalSignals) {
        let digitalIo = 0;
        let digitalIoMask = 0;
        digitalSignals.forEach((digital, index) => {
            if (digital >= 0) {
                digitalIoMask |= 1 << index;
                digitalIo |= (digital & 1) << index;
            }
        });

        return [digitalIo, digitalIoMask];
    }

    /**
     * PWM(Pulse Width Modulation)として入力された1-100の整数値をTWELITEが規定する0-1024または0xFF(設定しない)に変換する。
     *
     * @param pwm {number} PWMの入力値
     * @return {number[]}   変換された16進数の値の配列
     * @private
     */
    _convertAnalog(pwm) {
        if (0 <= pwm && pwm <= 100) {
            const value = parseInt(1024 * pwm / 100);

            return [value >> 8, value & 0xff];
        } else {
            return [0xff, 0xff];
        }
    }
}

module.exports = ChangeOutputCommand;
