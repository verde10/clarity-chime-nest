import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test sleep session management with validations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Start sleep session
    let block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'start-sleep-session', [], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Mine 36 blocks to simulate minimum sleep duration
    for (let i = 0; i < 36; i++) {
      chain.mineBlock([]);
    }

    // End sleep session with valid rating
    block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'end-sleep-session', [types.uint(8)], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify profile updated
    let response = chain.callReadOnlyFn('chime-nest', 'get-profile',
      [types.principal(deployer.address)], deployer.address
    );
    let profile = response.result.expectOk().expectTuple();
    assertEquals(profile['total-sessions'], types.uint(1));
    assertEquals(profile['reward-points'], types.uint(10));
  }
});

Clarinet.test({
  name: "Test white noise and alarm settings with validations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Test valid volume
    let block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'set-white-noise-preset',
        [types.ascii("rain"), types.uint(3600), types.uint(70)],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Test invalid volume
    block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'set-white-noise-preset',
        [types.ascii("rain"), types.uint(3600), types.uint(101)],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectErr(types.uint(105));

    // Test valid smart alarm
    block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'set-smart-alarm',
        [types.uint(28800), types.uint(1800)],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});
