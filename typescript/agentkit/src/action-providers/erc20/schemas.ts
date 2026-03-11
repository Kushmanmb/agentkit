import { z } from "zod";
import { ZERO_ADDRESS } from "../../utils";

/**
 * Input schema for transfer action.
 */
export const TransferSchema = z
  .object({
    amount: z
      .string()
      .describe("The amount of the asset to transfer in whole units (e.g. 1.5 USDC)"),
    tokenAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the token to transfer"),
    destinationAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .refine(
        val => val.toLowerCase() !== ZERO_ADDRESS,
        "Cannot use the zero address (0x0000000000000000000000000000000000000000). Sending to the zero address permanently burns funds.",
      )
      .describe("The destination to transfer the funds"),
  })
  .strip()
  .describe("Instructions for transferring assets");

/**
 * Input schema for get balance action.
 */
export const GetBalanceSchema = z
  .object({
    tokenAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the ERC20 token to get the balance for"),
    address: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe("The address to check the balance for. If not provided, uses the wallet's address"),
  })
  .strip()
  .describe("Instructions for getting wallet balance");

/**
 * Input schema for approve action.
 */
export const ApproveSchema = z
  .object({
    amount: z.string().describe("The amount to approve in whole units (e.g. 100 for 100 USDC)"),
    tokenAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the token"),
    spenderAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .refine(
        val => val.toLowerCase() !== ZERO_ADDRESS,
        "Cannot use the zero address (0x0000000000000000000000000000000000000000). Sending to the zero address permanently burns funds.",
      )
      .describe("The address to approve for spending tokens"),
  })
  .strip()
  .describe("Instructions for approving token spending");

/**
 * Input schema for allowance action.
 */
export const AllowanceSchema = z
  .object({
    tokenAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The contract address of the token"),
    spenderAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .describe("The address to check allowance for"),
  })
  .strip()
  .describe("Instructions for checking token allowance");

/**
 * Input schema for get token address action.
 */
export const GetTokenAddressSchema = z
  .object({
    symbol: z
      .string()
      .min(1)
      .max(10)
      .toUpperCase()
      .describe("The token symbol (e.g., USDC, WETH, DEGEN)"),
  })
  .strip()
  .describe("Instructions for getting a token's contract address by symbol");
