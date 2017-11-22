import TweliteCommand from './TweliteCommand';


export interface ReceiveStatusOptions {
    senderAddressId: number;
    packetId: number;
    lqi: number;
    senderSerialNumber: number;
    receiverAddressId: number;
    timestamp: number;
    relayCount: number;
    powerSupplyVoltage: number;
    digital: number[];
    analog: number[];
}

/**
 * 相手端末の状態通知を受けた時に出力されるUARTコマンド。
 * データフォーマットは以下の形式に従う。
 *  1: 1バイト：送信元の論理デバイスID (0x78 は子機からの通知)
 *  2: 1バイト：コマンド(0x81: IO状態の通知)
 *  3: 1バイト：パケット識別子 (アプリケーションIDより生成される)
 *  4: 1バイト：プロトコルバージョン (0x01 固定)
 *  5: 1バイト：LQI値、電波強度に応じた値で 0xFF が最大、0x00 が最小
 *  6: 4バイト：送信元の個体識別番号
 *  7: 1バイト：宛先の論理デバイスID
 *  8: 2バイト：タイムスタンプ (秒64カウント)
 *  9: 1バイト：中継フラグ(中継回数0~3)
 *  a: 2バイト：電源電圧[mV]
 *  b: 1バイト：未使用
 *  c: 1バイト：D1バイト：I の状態ビット。DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1がOn(Lowレベル)。
 *  d: 1バイト：DI の変更状態ビット。DI1(0x1) DI2(0x2) DI3(0x4) DI4(0x8)。1が変更対象。
 *  e1～e4: AD1～AD4の変換値。0～2000[mV]のAD値を16で割った値を格納。
 *  ef: AD1～AD4の補正値　（LSBから順に２ビットずつ補正値、LSB側が　AD1, MSB側が AD4）
 *  g: 1バイト：チェックサム
 *
 * @see https://mono-wireless.com/jp/products/TWE-APPS/App_Twelite/step3-81.html
 * @class
 * @extends TweliteCommand
 */
class ReceiveStatusCommand extends TweliteCommand {
    private _senderAddressId: number;
    private _command: number;
    private _packetId: number;
    private _linkQualityIndicator: number;
    private _senderSerialNumber: number;
    private _timestamp: number;
    private _relayCount: number;
    private _powerSupplyVoltage: number;

    private _digital: number[];
    private _analog: number[];

    public static decode(data: string): ReceiveStatusCommand {
        const markBits: number[] = data
            .replace(':', '')       // remove start bit
            .replace('\r\n', '')    // remove end bit
            .split(/(.{2})/)
            .filter(v => v !== "")
            .map(v => parseInt(v, 16));     // separate hex array.

        // has required array size?
        if (markBits.length !== 24) {
            console.error('Provided data format, mark bit array size, is invalid.');
        }

        // has valid checksum?
        // TODO: implements verify checksum logic.
        // const checksum = markBits[23];
        // const sum = markBits.slice(0, 23).reduce((prev, current) => prev + current);

        // ignores
        // const command = markBits[1];
        // const protocolVersion = markBits[3];
        // const unused = markBits[15];

        const senderAddressId = markBits[0];
        const packetId = markBits[2];
        const lqi = markBits[4] / ((7 * markBits[4] - 1970) / 20);    // [dbm]
        // '>>> 0' converts to unsigned
        const senderSerialNumber = (markBits[5] << 24 | markBits[6] << 16 | markBits[7] << 8 | markBits[8]) >>> 0;
        const receiverAddressId = markBits[9];
        const timestamp = (markBits[10] << 8 | markBits[11]) / 64;      // [s]
        const relayCount = markBits[12];
        const powerSupplyVoltage = markBits[13] << 8 | markBits[14];    // [mv]

        const rawDigitalIn = markBits[16];
        const digitalIn: number[] = [
            (rawDigitalIn >> 0 & 1) ? 1 : 0,
            (rawDigitalIn >> 1 & 1) ? 1 : 0,
            (rawDigitalIn >> 2 & 1) ? 1 : 0,
            (rawDigitalIn >> 3 & 1) ? 1 : 0,
        ];

        const rawDigitalChanged = markBits[17];
        const digitalChanged: boolean[] = [
            !!(rawDigitalChanged >> 0 & 1),
            !!(rawDigitalChanged >> 1 & 1),
            !!(rawDigitalChanged >> 2 & 1),
            !!(rawDigitalChanged >> 3 & 1),
        ];
        const digital = digitalIn.map((d, index) => digitalChanged[index] ? d : -1);


        const analogIn = [
            markBits[18],
            markBits[19],
            markBits[20],
            markBits[21],
        ];
        const analogOffset = markBits[22];
        const analog = analogIn.map((a, index) => {
            const er = analogOffset >> 2 * index;
            return a === 0xFF ?
                -1 : //未使用(VCC接続)
                ((a * 4) + (er & 0x3)) * 4;
        });

        return new ReceiveStatusCommand({
            senderAddressId,
            packetId,
            lqi,
            senderSerialNumber,
            receiverAddressId,
            timestamp,
            relayCount,
            powerSupplyVoltage,
            digital,
            analog
        });
    }

    /**
     *
     * @param {ReceiveStatusOptions} opts
     */
    public constructor(opts: ReceiveStatusOptions) {
        super(opts.receiverAddressId);
        this._command = 0x81;

        this._senderAddressId = opts.senderAddressId;
        this._packetId = opts.packetId;
        this._linkQualityIndicator = opts.lqi;
        this._senderSerialNumber = opts.senderSerialNumber;
        this._timestamp = opts.timestamp;
        this._relayCount = opts.relayCount;
        this._powerSupplyVoltage = opts.powerSupplyVoltage;
        this._digital = opts.digital;
        this._analog = opts.analog;
    }

    /**
     * 送信元の宛先アドレス（論理デバイスID）
     *
     * @return {number}
     * @readonly
     */
    public get senderAddressId(): number {
        return this._senderAddressId;
    }

    /**
     * コマンド番号 (0x81 固定)
     *
     * @return {number}
     * @readonly
     */
    public get command(): number {
        return this._command;
    }

    /**
     * パケット識別子 (アプリケーションIDより生成される)
     *
     * @return {number}
     * @readonly
     */
    public get packetId(): number {
        return this._packetId;
    }

    /**
     * LQI値、電波強度に応じた値で 0xFF が最大、0x00 が最小
     *
     * @return {number}
     */
    public get linkQualityIndicator(): number {
        return this._linkQualityIndicator;
    }

    /**
     * 送信元の個体識別番号
     *
     * @return {number}
     */
    public get senderSerialNumber(): number {
        return this._senderSerialNumber;
    }

    /**
     * タイムスタンプ (64カウント/秒)
     *
     * @return {number}
     */
    public get timestamp(): number {
        return this._timestamp;
    }

    /**
     * 中継フラグ(中継回数0~3)
     *
     * @return {number}
     */
    public get relayCount(): number {
        return this._relayCount;
    }

    /**
     * 電源電圧[mV]
     *
     * @return {number}
     */
    public get powerSupplyVoltage(): number {
        return this._powerSupplyVoltage;
    }

    /**
     * DI1/DI2/DI3/DI4の設定値。number型の配列にそれぞれの値が格納される。
     * 値は0がHi(制御対象にする)、1がLo(制御対象にする)、-1が(制御対象にしない)。
     *
     * @return {number[]}
     */
    public get digital(): number[] {
        return this._digital;
    }

    /**
     * AD1/AD2/AD3/AD4の変換値。0～2000[mV]
     * 未使用(VCC接続) の場合、0xFF
     *
     * @return {number[]}
     */
    public get analog(): number[] {
        return this._analog;
    }
}

export default ReceiveStatusCommand;
