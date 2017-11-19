/**
 * TWELITE端末を遠隔操作するためのUARTコマンドを表現する基底クラス。
 * 各種コマンドで共通するデータフォーマットとして、先頭が : （コロン）で続いて 0-9 A-F の文字列が連続し <CR><LF>で終端する。
 *
 * @see https://mono-wireless.com/jp/products/TWE-APPS/App_Twelite/step3-01.html
 * @class
 */
class TweliteCommand {
    private _startBit: string;
    private _stopBit: string;
    private _addressId: number;
    private _protocolVersion: number;

    static get AddressIds() {
        return {
            MASTER_UNIT: 0x00,
            ALL_SLAVE_UNITS: 0x78
        }
    };

    constructor(addressId?: number) {
        this._startBit = ':';
        this._stopBit = '\r\n';
        this._addressId = addressId || TweliteCommand.AddressIds.ALL_SLAVE_UNITS;
        this._protocolVersion = 0x01;
    }

    /**
     * UART通信のデータフォーマットで定義される通信開始を示すビット
     *
     * @type {string}
     * @readonly
     */
    get startBit(): string {
        return this._startBit;
    }

    /**
     * UART通信のデータフォーマットで定義される通信開始を示すビット
     *
     * @return {string}
     * @readonly
     */
    get stopBit(): string {
        return this._stopBit;
    }

    /**
     * 宛先アドレス（論理デバイスID） (0x00: 親機, 0x01 ～ 0x64: 子機ID指定, 0x78: 全子機)
     *
     * @return {number}
     * @readonly
     */
    get addressId(): number {
        return this._addressId;
    }

    /**
     * 書式バージョン (0x01 固定, 将来のための拡張)
     *
     * @return {number}
     * @readonly
     */
    get protocolVersion(): number {
        return this._protocolVersion;
    }

    /**
     * TWELITEが規定したデータフォーマットに従う、シリアル通信するための文字列を構築する。
     *
     * @abstract
     */
    build(): string {
        throw new Error('No implementation.');
    };

    /**
     * 受け取ったデータが正しいかどうかを確認するための付加データを計算する
     * データ部の各バイトの和を８ビット幅で計算し２の補数をとる
     *
     * @param data {number[]}
     * @return {number}
     * @protected
     * @see https://mono-wireless.com/jp/products/MoNoStick/control.html
     */
    _calculateCheckSum(data: number[]): number {
        let checkSum = 0;
        data.forEach(d => {
            checkSum = (checkSum + d) & 0xff
        });

        return (0x100 - checkSum) & 0xff;
    }

    /**
     * 入力された数字(1バイト)を16進数の文字列2文字に変換する。
     * 16進数で3桁以上のNumberが入力された場合、最後の二桁のみを返す。
     *
     * @param decimal {number}
     * @return {string}
     * @protected
     */
    _convertToHex(decimal: number): string {
        return ('00' + decimal.toString(16).toUpperCase()).substr(-2);
    }
}

export default TweliteCommand;
