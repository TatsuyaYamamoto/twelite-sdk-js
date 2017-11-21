import ChangeOutputCommand from '../../src/command/ChangeOutputCommand';

describe('ChangeOutputCommand', () => {
    describe('Build hex string', () => {
        it('with default value', () => {
            const command = new ChangeOutputCommand();
            expect(command.build()).toBe(':7880010000FFFFFFFFFFFFFFFF0F\r\n');
        });
        it('with modified digital value.', () => {
            const command = new ChangeOutputCommand();
            command.digital = [1, -1, 0, 1];
            expect(command.build()).toBe(':788001090DFFFFFFFFFFFFFFFFF9\r\n');
        });

        it('with modified analog value.', () => {
            const command = new ChangeOutputCommand();
            command.analog = [50, 13, 89, 28];
            expect(command.build()).toBe(':788001000002000085038F011ECF\r\n');
        });

        it('with modified analog and digital value.', () => {
            const command = new ChangeOutputCommand();
            command.digital = [0, 1, -1, -1];
            command.analog = [72, 33, 19, 46];
            expect(command.build()).toBe(':788001020302E1015100C201D733\r\n');
        });
    });

    describe('Converting digital signal', () => {
        const convert = new ChangeOutputCommand()._convertDigital;

        it('should convert correctly.', () => {
            expect(convert([-1, -1, -1, -1])).toEqual([0, 0]);
            expect(convert([0, -1, -1, -1])).toEqual([0, 1]);
            expect(convert([-1, 0, -1, -1])).toEqual([0, 2]);
            expect(convert([-1, -1, 0, -1])).toEqual([0, 4]);
            expect(convert([-1, -1, -1, 0])).toEqual([0, 8]);

            expect(convert([0, 0, 0, 0])).toEqual([0, 15]);
            expect(convert([0, 0, 0, 1])).toEqual([8, 15]);
            expect(convert([0, 0, 2, 0])).toEqual([0, 15]);
        });

        it('should evaluate number to be smaller than -1 as input -1', () => {
            expect(convert([-1, -1, -1, -1])).toEqual([0, 0]);
            expect(convert([-2, -1, -1, -1])).toEqual([0, 0]);
            expect(convert([-2, -11, -1, -1])).toEqual([0, 0]);
            expect(convert([-2, -11, -100, -1])).toEqual([0, 0]);
        });

        it('should evaluate number to be larger than 2 and uneven number as input 1', () => {
            expect(convert([1, 1, 1, 1])).toEqual([15, 15]);
            expect(convert([1, 3, 1, 1])).toEqual([15, 15]);
            expect(convert([3, 1, 5, 1])).toEqual([15, 15]);
            expect(convert([11, 1, 121, 33])).toEqual([15, 15]);
        });

        it('should evaluate number to be larger than 2 and even number as input 0', () => {
            expect(convert([0, 0, 0, 0])).toEqual([0, 15]);
            expect(convert([2, 2, 2, 2])).toEqual([0, 15]);
            expect(convert([4, 4, 4, 4])).toEqual([0, 15]);
            expect(convert([6, 6, 6, 6])).toEqual([0, 15]);
            expect(convert([10, 200, 40, 266])).toEqual([0, 15]);

        });

        it('should round down fractional value before evaluating', () => {
            expect(convert([0.1, 0.5, 0.01, 0.11])).toEqual(convert([0, 0, 0, 0]));
            expect(convert([2.9, 2.99, 2.999, 2.9999])).toEqual(convert([2, 2, 2, 2]));
            expect(convert([3.5, 1.4, 5.9, 1.1])).toEqual(convert([3, 1, 5, 1]));
        });
    });

    describe('Converting analog signal', () => {
        const convert = new ChangeOutputCommand()._convertAnalog;

        it('should return input, 0-100, to valid value.', () => {
            expect(convert(0)).toEqual([0, 0]);
            expect(convert(1)).toEqual([0, 10]);
            expect(convert(2)).toEqual([0, 20]);
            expect(convert(44)).toEqual([1, 194]);
            expect(convert(50)).toEqual([2, 0]);
            expect(convert(100)).toEqual([4, 0]);
        });

        it('should return 0xff with smaller than 0 or larger than 100', () => {
            expect(convert(-100)).toEqual([0xff, 0xff]);
            expect(convert(-2)).toEqual([0xff, 0xff]);
            expect(convert(-1)).toEqual([0xff, 0xff]);
            expect(convert(101)).toEqual([0xff, 0xff]);
            expect(convert(200)).toEqual([0xff, 0xff]);
        });
    });
});
