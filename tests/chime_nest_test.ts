import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test sleep session management",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Start sleep session
    let block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'start-sleep-session', [], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify active session
    let response = chain.callReadOnlyFn('chime-nest', 'get-active-session', 
      [types.principal(deployer.address)], deployer.address
    );
    response.result.expectOk().expectBool(true);

    // End sleep session
    block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'end-sleep-session', [types.uint(8)], deployer.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Verify profile updated
    response = chain.callReadOnlyFn('chime-nest', 'get-profile',
      [types.principal(deployer.address)], deployer.address
    );
    let profile = response.result.expectOk().expectTuple();
    assertEquals(profile['total-sessions'], types.uint(1));
    assertEquals(profile['reward-points'], types.uint(10));
  }
});

Clarinet.test({
  name: "Test white noise and alarm settings",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Set white noise preset
    let block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'set-white-noise-preset',
        [types.ascii("rain"), types.uint(3600), types.uint(70)],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);

    // Set smart alarm
    block = chain.mineBlock([
      Tx.contractCall('chime-nest', 'set-smart-alarm',
        [types.uint(28800), types.uint(1800)],
        deployer.address
      )
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});
