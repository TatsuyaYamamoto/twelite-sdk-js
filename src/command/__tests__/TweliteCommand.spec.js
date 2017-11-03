const TweliteCommand = require('../TweliteCommand');

describe('TweliteCommand', () => {
    describe('Calculating check sum', () => {
        const checkSum = new TweliteCommand()._calculateCheckSum;

        it('should return valid check sum number', () => {
            expect(checkSum([1])).toEqual(255);
            expect(checkSum([1, 2])).toEqual(253);
            expect(checkSum([1, 2, 3])).toEqual(250);
            expect(checkSum([1, 2, 3, 4])).toEqual(246);

            expect(checkSum([120, 128, 1, 0, 0, 255, 255, 0, 0, 2, 0, 4, 0])).toEqual(3);
            expect(checkSum([0xC0, 0xA8, 0xFF, 0x58])).toEqual(0x41);
        });
    });

    describe('Converting hex string', () => {
        const convert = new TweliteCommand()._convertToHex;

        it('can convert to hex.', () => {
            expect(convert(0)).toBe('00'); // 0x00
            expect(convert(11)).toBe('0B'); // 0x0b
            expect(convert(222)).toBe('DE'); // 0xDE
        });

        it('should return last 2 characters of upper case string.', () => {
            expect(typeof convert(1)).toBe('string');
            expect(convert(0)).toMatch(/[0-9A-F]{2}/);
            expect(convert(1)).toMatch(/[0-9A-F]{2}/);
            expect(convert(10)).toMatch(/[0-9A-F]{2}/);
            expect(convert(100)).toMatch(/[0-9A-F]{2}/);
            expect(convert(10000)).toMatch(/[0-9A-F]{2}/);
        });
    });
});
