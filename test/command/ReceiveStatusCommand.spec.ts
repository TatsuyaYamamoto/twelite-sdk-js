import ReceiveStatusCommand from '../../src/command/ReceiveStatusCommand';

describe('ReceiveStatusCommand', () => {
    describe('Decode from string data', () => {
        it('with no change outputs', () => {
            const data = ':7881150175810000380026C9000C04220000FFFFFFFFFFA7\r\n';
            const command = ReceiveStatusCommand.decode(data);

            const expected = {
                senderAddressId: 0x78,
                command: 0x81,
                packetId: 0x15,
                protocolVersion: 0x01,
                linkQualityIndicator: 117 / -57.55,
                senderSerialNumber: 0x81000038,
                addressId: 0x00,
                timestamp: 155.140625,
                relayCount: 0,
                powerSupplyVoltage: 3076,
                digital: [-1, -1, -1, -1],
                analog: [-1, -1, -1, -1],
            };

            assert(command, expected);
        });

        it('with active digital output.', () => {
            const data = ':00811501D28100693F001115000D2D1D0101FFFFFFFFFFF4\r\n';
            const command = ReceiveStatusCommand.decode(data);

            const expected = {
                senderAddressId: 0x00,
                command: 0x81,
                packetId: 0x15,
                protocolVersion: 0x01,
                linkQualityIndicator: 210 / -25.00,
                senderSerialNumber: 2164287807,
                addressId: 0x00,
                timestamp: 68.328125,
                relayCount: 0,
                powerSupplyVoltage: 3373,
                digital: [1, -1, -1, -1],
                analog: [-1, -1, -1, -1],
            };

            assert(command, expected);
        });

        it('with active analog output.', () => {
            const data = ':7881150157810076ED780BE1000A942900013408190254DF\r\n';
            const command = ReceiveStatusCommand.decode(data);

            const expected = {
                senderAddressId: 0x78,
                command: 0x81,
                packetId: 0x15,
                protocolVersion: 0x01,
                linkQualityIndicator: 87 / -68.05,
                senderSerialNumber: 0x810076ed,
                addressId: 0x78,
                timestamp: 47.515625,
                relayCount: 0,
                powerSupplyVoltage: 2708,
                digital: [0, -1, -1, -1],
                analog: [832, 132, 404, 36],
            };

            assert(command, expected);
        });

        function assert(command, expected) {
            expect(command.senderAddressId).toEqual(expected.senderAddressId);
            expect(command.command).toEqual(expected.command);
            expect(command.packetId).toEqual(expected.packetId);
            expect(command.protocolVersion).toEqual(expected.protocolVersion);
            expect(command.linkQualityIndicator).toEqual(expected.linkQualityIndicator);
            expect(command.senderSerialNumber).toEqual(expected.senderSerialNumber);
            expect(command.addressId).toEqual(expected.addressId);
            expect(command.timestamp).toEqual(expected.timestamp);
            expect(command.relayCount).toEqual(expected.relayCount);
            expect(command.powerSupplyVoltage).toEqual(expected.powerSupplyVoltage);
            expect(command.digital).toEqual(expected.digital);
            expect(command.analog).toEqual(expected.analog);
        }
    });
});
