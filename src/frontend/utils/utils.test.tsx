import cbor from "cbor-js";
import {
  decodeHexToAscii,
  hexToString,
  assetDecoder,
  byteArrayToHex,
  processAssets,
} from './utils';
import { Asset } from '../types/types';

// Mock the cbor library
jest.mock('cbor-js', () => ({
  decode: jest.fn(),
}));

describe('Utility Functions', () => {
  describe('decodeHexToAscii', () => {
    it('should decode hex asset names to ASCII', () => {
      const assets: Asset[] = [
        { policyID: 'policy1', assetName: '74657374', amount: 1000 }, // "74657374" is "test" in hex
      ];
      const expected: Asset[] = [
        { policyID: 'policy1', assetName: 'test', amount: 1000 },
      ];

      const result = decodeHexToAscii(assets);
      expect(result).toEqual(expected);
    });
  });

  describe('hexToString', () => {
    it('should convert hex to string', () => {
      const hex = '74657374'; // "test" in hex
      const expected = 'test';

      const result = hexToString(hex);
      expect(result).toBe(expected);
    });

    it('should handle empty string', () => {
      const hex = '';
      const expected = '';

      const result = hexToString(hex);
      expect(result).toBe(expected);
    });
  });

  describe('assetDecoder', () => {
    it('should decode CBOR hex data array', () => {
      const hexDataArray = [
        "82825820af2e3d3a1580635c438302dd1b0d788088f78dc1234f49783b2d370b5672c24f028258390018e5238d571507a7ce61400613bbbd8bf4ff29e8ec342d964fe3b11a22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a2ca05d5a",
        "82825820af2e3d3a1580635c438302dd1b0d788088f78dc1234f49783b2d370b5672c24f038258390018e5238d571507a7ce61400613bbbd8bf4ff29e8ec342d964fe3b11a22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a2ca05d5a",
        "82825820af2e3d3a1580635c438302dd1b0d788088f78dc1234f49783b2d370b5672c24f048258390018e5238d571507a7ce61400613bbbd8bf4ff29e8ec342d964fe3b11a22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a004c4b40",
        "82825820e435efffa2a837f2669666e171ea9c938f4a93cc096e5026ea87daaa39af47600182583900017251d58fac5cb07b29d5b28ace710b5c6c3cebbf361d3c0af4775022705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a00159523",
        "82825820204e6f1bd7a6a5da7863c30edf808e1b5046fb8eb7fb97b5d05ee686791c6079028258390047098d7f358c3b6a5e95b5631e52e284559d0e57ef189bbc3fe6310b22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a1db437b0",
        "82825820204e6f1bd7a6a5da7863c30edf808e1b5046fb8eb7fb97b5d05ee686791c6079038258390047098d7f358c3b6a5e95b5631e52e284559d0e57ef189bbc3fe6310b22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a1db437b0",
        "8282582068240f64652647f83ec19c52929b89fe4566d710f73cd93dbe953dbe2a2d6b010082583900dc22fbe119b52650b44a1d95e96d23ffd627bf187fc4876d2bf745cc22705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a1dcd6500",
        "828258205a79679824b24311d3a8ebeeed491cdedbb8f13ca450789731f6abc237f90c1c0082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00114bdaa1581c2cf882d92927ccb33fd7a74b2818fdaf0689f46a4fa532c5c90ebfeba14361736401",
        "828258205105a70d7e2491870a7d9e2830e27128042e283cdd89e669614a41c6a0a410c90082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00115cb0a1581c2cf882d92927ccb33fd7a74b2818fdaf0689f46a4fa532c5c90ebfeba144656d697201",
        "8282582068f4e1033961516f9c26374321757322d3dea9d01aefb21915643fd35e4653b60082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00114bdaa1581c9c8e9da7f81e3ca90485f32ebefc98137c8ac260a072a00c4aaf142da14361736401",
        "828258201c740b81a676b9e789863c053fbd00dc3aa511746669fa590454a14a4521091b0082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a0011c1b4a1581c9c8e9da7f81e3ca90485f32ebefc98137c8ac260a072a00c4aaf142da14a6c6974746c656669736804",
        "828258206dac02b8a49e07e3db7a78d6e5e487ed4c3da1952beb5a4368243038d949c1180082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00114bdaa1581c9c8e9da7f81e3ca90485f32ebefc98137c8ac260a072a00c4aaf142da1426171181f",
        "82825820ba0f804c3a9cb3161c8b5137603988ba43f419fc4bab7ec705d775baff9f62920082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a001215e2a1581c9c8e9da7f81e3ca90485f32ebefc98137c8ac260a072a00c4aaf142da14b61736461736473647364731a0001e0f3",
        "8282582072871f69b0cef95fa49e8a5974c1732353c5cce93a0339b461937f3a74cc14220082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00115cb0a1581c385f749eab39b6f35a587b3ee803264bbee911cf979a3fd0c1007858a144656d697201",
        "82825820b70fdf682ba47c164feb347bd4ad8dea0ef7f5f6e072bf920e7d5b5a9129756c0082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00114bdaa1581c385f749eab39b6f35a587b3ee803264bbee911cf979a3fd0c1007858a14361736401",
        "82825820e5a4b8379443e39ef9fff97352b61f4524518f32e5375393329167d1437248bc0082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00114bdaa1581c385f749eab39b6f35a587b3ee803264bbee911cf979a3fd0c1007858a14361736401",
        "82825820eb59b12203aeb048afc59f72c092c8dfa99f6737fe85aaf25ab23f4b71b1e58b0182583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf1a3a394d2f",
        "828258206fb67983735999f607a9655ff2c86f66029f37d319ef09aed16e8d6aa23440480082583900a74b859003d383718116848fa3ed745affe27b14e7441dd1bf5fb27622705449c7b85d8db14eb4b64034fc4a1d4b9a81e94109cdac43badf821a00989680a2581c72d99df11a4218d5bb62a8c7d8f2cb39f55cbfd8aae689e427327b08a24574657374310145746573743202581cdde323780fa3056ed309e20f3ce1b91571b554f3ee2c4683623e3a68a145746573743301"
    ];

      const mockDecoded = [
        [
          [
            new Uint8Array([0xaf, 0x2e, 0x3d, 0x3a, 0x15, 0x80, 0x63, 0x5c, 0x43, 0x83, 0x02, 0xdd, 0x1b, 0x0d, 0x78, 0x80, 0x88, 0xf7, 0x8d, 0xc1, 0x23, 0x4f, 0x49, 0x78, 0x3b, 0x2d, 0x37, 0x0b, 0x56, 0x72, 0xc2, 0x4f]),
            [
              1000000, 
              {
                "a018e5238d571507a7ce61400613bbbd8bf4ff29e8ec342d964fe3b11a22705449c7b85d": 100
              }
            ]
          ]
        ]
      ];

      (cbor.decode as jest.Mock).mockReturnValue(mockDecoded);

      const result = assetDecoder(hexDataArray);

      expect(cbor.decode).toHaveBeenCalled();
      expect(result).toEqual([
        [
          "af2e3d3a1580635c438302dd1b0d788088f78dc1234f49783b2d370b5672c24f",
          "a018e5238d571507a7ce61400613bbbd8bf4ff29e8ec342d964fe3b11a22705449c7b85d",
          100
        ]
      ]);
    });
  });

  describe('byteArrayToHex', () => {
    it('should convert byte array to hex string', () => {
      const buffer = new Uint8Array([116, 101, 115, 116]); // "test"
      const expected = '74657374';

      const result = byteArrayToHex(buffer);
      expect(result).toBe(expected);
    });
  });

  describe('processAssets', () => {
    it('should process input array into assets', () => {
      const inputArray = [
        ['policy1', 'asset1', 100],
        ['policy2', 'asset2', 200],
      ];
      const expected: Asset[] = [
        { policyID: 'policy1', assetName: 'asset1', amount: 100 },
        { policyID: 'policy2', assetName: 'asset2', amount: 200 },
      ];

      const result = processAssets(inputArray);
      expect(result).toEqual(expected);
    });

    it('should process nested asset data', () => {
      const inputArray = [
        ['policy1', 'asset1', '100'],
        ['policy1', 'asset2', '200'],
        ['policy2', 'asset3', '300'],
      ];
      const expected: Asset[] = [
        { policyID: 'policy1', assetName: 'asset1', amount: 100 },
        { policyID: 'policy1', assetName: 'asset2', amount: 200 },
        { policyID: 'policy2', assetName: 'asset3', amount: 300 },
      ];

      const result = processAssets(inputArray);
      expect(result).toEqual(expected);
    });
  });
});
