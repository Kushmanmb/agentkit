import { encodeFunctionData } from "viem";
import { superfluidStreamActionProvider } from "./superfluidStreamActionProvider";
import { CFAv1ForwarderAddress, CFAv1ForwarderABI } from "./constants";
import { SuperfluidCreateStreamSchema, SuperfluidDeleteStreamSchema } from "./schemas";
import { EvmWalletProvider } from "../../wallet-providers";
import { ZERO_ADDRESS } from "../../utils";

describe("SuperfluidStreamActionProvider", () => {
  const MOCK_ADDRESS = "0xe6b2af36b3bb8d47206a129ff11d5a2de2a63c83";
  const MOCK_ERC20_CONTRACT = "0x1234567890123456789012345678901234567890";
  const MOCK_RECIPIENT_ADDRESS = "0x9876543210987654321098765432109876543210";
  const MOCK_FLOW_RATE = "123";
  const MOCK_CHAIN_ID = "8453";

  let mockWallet: jest.Mocked<EvmWalletProvider>;
  const actionProvider = superfluidStreamActionProvider();

  beforeEach(() => {
    mockWallet = {
      getAddress: jest.fn().mockReturnValue(MOCK_ADDRESS),
      getNetwork: jest.fn().mockReturnValue({ protocolFamily: "evm" }),
      sendTransaction: jest.fn(),
      waitForTransactionReceipt: jest.fn(),
      readContract: jest.fn(),
      call: jest.fn(),
    } as unknown as jest.Mocked<EvmWalletProvider>;

    mockWallet.sendTransaction.mockResolvedValue("0xmockhash" as `0x${string}`);
    mockWallet.waitForTransactionReceipt.mockResolvedValue({});
  });

  describe("create stream", () => {
    it("should successfully create a superfluid stream", async () => {
      const args = {
        superTokenAddress: MOCK_ERC20_CONTRACT,
        chainId: MOCK_CHAIN_ID,
        recipientAddress: MOCK_RECIPIENT_ADDRESS,
        flowRate: MOCK_FLOW_RATE,
      };

      await actionProvider.createStream(mockWallet, args);

      expect(mockWallet.sendTransaction).toHaveBeenCalledWith({
        to: CFAv1ForwarderAddress,
        data: encodeFunctionData({
          abi: CFAv1ForwarderABI,
          functionName: "createFlow",
          args: [
            MOCK_ERC20_CONTRACT,
            MOCK_ADDRESS,
            MOCK_RECIPIENT_ADDRESS,
            BigInt(MOCK_FLOW_RATE),
            "0x",
          ],
        }),
      });

      expect(mockWallet.waitForTransactionReceipt).toHaveBeenCalledWith("0xmockhash");
    });

    it("should handle stream creation errors", async () => {
      const error = new Error("Stream creation failed");
      mockWallet.sendTransaction.mockRejectedValue(error);

      const args = {
        superTokenAddress: MOCK_ERC20_CONTRACT,
        chainId: MOCK_CHAIN_ID,
        recipientAddress: MOCK_RECIPIENT_ADDRESS,
        flowRate: MOCK_FLOW_RATE,
      };

      const response = await actionProvider.createStream(mockWallet, args);
      expect(response).toBe(`Error creating Superfluid stream: ${error}`);
    });

    it("should reject the zero address as recipient", () => {
      const result = SuperfluidCreateStreamSchema.safeParse({
        superTokenAddress: MOCK_ERC20_CONTRACT,
        recipientAddress: ZERO_ADDRESS,
        flowRate: MOCK_FLOW_RATE,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("zero address");
      }
    });

    it("should reject the zero address as superTokenAddress", () => {
      const result = SuperfluidCreateStreamSchema.safeParse({
        superTokenAddress: ZERO_ADDRESS,
        recipientAddress: MOCK_RECIPIENT_ADDRESS,
        flowRate: MOCK_FLOW_RATE,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("zero address");
      }
    });
  });

  describe("delete stream schema", () => {
    it("should reject the zero address as recipient", () => {
      const result = SuperfluidDeleteStreamSchema.safeParse({
        superTokenAddress: MOCK_ERC20_CONTRACT,
        recipientAddress: ZERO_ADDRESS,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("zero address");
      }
    });

    it("should reject the zero address as superTokenAddress", () => {
      const result = SuperfluidDeleteStreamSchema.safeParse({
        superTokenAddress: ZERO_ADDRESS,
        recipientAddress: MOCK_RECIPIENT_ADDRESS,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("zero address");
      }
    });
  });

  describe("supportsNetwork", () => {
    it("should return true for Base", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "evm",
        networkId: "base-mainnet",
      });
      expect(result).toBe(true);
    });

    it("should return false for non-base networks", () => {
      const result = actionProvider.supportsNetwork({
        protocolFamily: "bitcoin",
        networkId: "any",
      });
      expect(result).toBe(false);
    });
  });
});
