import type { BankingProvider, BankingProviderName } from '@soro/types';
import { createBankingProvider, type DemoBankingOptions } from '@soro/banking';

/**
 * Banking engine shell (Phase 0).
 *
 * The ONLY place provider adapters are selected. Everything upstream
 * (conversation, orchestration) talks to `BankingProvider`, never to
 * Wema/Demo concretes. See docs/BANKING.md.
 */

export const SERVICE_NAME = 'banking';

export function selectProvider(
  name: BankingProviderName,
  demoOptions?: DemoBankingOptions,
): BankingProvider {
  return createBankingProvider(name, demoOptions);
}
