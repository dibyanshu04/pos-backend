/**
 * Round-Off Utility
 * 
 * Implements deterministic Indian billing round-off logic (₹0.05 / ₹0.10 / ₹1.00)
 * Petpooja-style rounding with decimal-safe arithmetic
 * 
 * CRITICAL: All rounding must use this utility to ensure consistency
 */

export type RoundOffMethod = 'NEAREST' | 'UP' | 'DOWN';
export type RoundOffPrecision = 0.05 | 0.1 | 1.0;

export interface RoundOffConfig {
  enabled: boolean;
  method: RoundOffMethod;
  precision: RoundOffPrecision;
}

export interface RoundOffResult {
  grossAmount: number;      // Amount before round-off
  roundedAmount: number;    // Amount after round-off
  roundOffAmount: number;   // Difference (can be + or -)
  netPayable: number;       // Final amount to be paid (same as roundedAmount)
}

/**
 * Round a number to the specified precision using the specified method
 * Uses decimal-safe arithmetic to avoid floating point errors
 * 
 * @param amount - Amount to round (gross amount after tax and discount)
 * @param precision - Rounding precision (0.05, 0.1, or 1.0)
 * @param method - Rounding method (NEAREST, UP, or DOWN)
 * @returns Rounded amount with proper decimal precision
 */
export function roundAmount(
  amount: number,
  precision: RoundOffPrecision,
  method: RoundOffMethod,
): number {
  // Validate inputs
  if (amount < 0) {
    throw new Error('Amount cannot be negative for rounding');
  }

  if (![0.05, 0.1, 1.0].includes(precision)) {
    throw new Error(`Invalid precision: ${precision}. Must be 0.05, 0.1, or 1.0`);
  }

  // Convert to cents/paise to avoid floating point issues
  // Multiply by 100 to work with integers
  const amountInCents = Math.round(amount * 100);
  const precisionInCents = Math.round(precision * 100);

  let roundedCents: number;

  switch (method) {
    case 'NEAREST':
      // Round to nearest precision value
      // Example: 123.03 with precision 0.05 = 123.05
      roundedCents = Math.round(amountInCents / precisionInCents) * precisionInCents;
      break;

    case 'UP':
      // Always round upwards (ceiling)
      // Example: 123.01 with precision 0.05 = 123.05
      roundedCents = Math.ceil(amountInCents / precisionInCents) * precisionInCents;
      break;

    case 'DOWN':
      // Always round downwards (floor)
      // Example: 123.09 with precision 0.05 = 123.05
      roundedCents = Math.floor(amountInCents / precisionInCents) * precisionInCents;
      break;

    default:
      throw new Error(`Invalid rounding method: ${method}`);
  }

  // Convert back to rupees with proper decimal precision
  // Use toFixed to ensure correct decimal places, then parse back
  const roundedAmount = roundedCents / 100;
  
  // Round to 2 decimal places to handle any floating point artifacts
  return Math.round(roundedAmount * 100) / 100;
}

/**
 * Calculate round-off for a bill
 * 
 * @param grossAmount - Gross amount (subtotal + tax - discount)
 * @param config - Round-off configuration
 * @returns Round-off result with all calculated values
 */
export function calculateRoundOff(
  grossAmount: number,
  config: RoundOffConfig,
): RoundOffResult {
  // If round-off is disabled, return zero round-off
  if (!config.enabled) {
    return {
      grossAmount,
      roundedAmount: grossAmount,
      roundOffAmount: 0,
      netPayable: grossAmount,
    };
  }

  // Validate gross amount
  if (grossAmount < 0) {
    throw new Error('Gross amount cannot be negative');
  }

  // Calculate rounded amount
  const roundedAmount = roundAmount(grossAmount, config.precision, config.method);

  // Calculate round-off difference
  // This can be positive (rounding up) or negative (rounding down)
  const roundOffAmount = roundedAmount - grossAmount;

  // Net payable is the rounded amount (final amount customer pays)
  // Ensure it's never negative
  const netPayable = Math.max(0, roundedAmount);

  return {
    grossAmount: Math.round(grossAmount * 100) / 100, // Round to 2 decimals
    roundedAmount: Math.round(roundedAmount * 100) / 100,
    roundOffAmount: Math.round(roundOffAmount * 100) / 100,
    netPayable: Math.round(netPayable * 100) / 100,
  };
}

/**
 * Get default round-off configuration (Petpooja-style defaults)
 */
export function getDefaultRoundOffConfig(): RoundOffConfig {
  return {
    enabled: true,
    method: 'NEAREST',
    precision: 0.05,
  };
}


