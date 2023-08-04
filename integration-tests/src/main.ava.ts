import { Worker, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount("test-account");

  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // const mintbaseNftContract = await root.createAccount("mintbase-nft-contract");
  // await mintbaseNftContract.deploy(
  //   "./integration-tests/wasm-repo/xanoishere.mintspace2.testnet.wasm"
  // );

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

test("mints a token", async (t) => {
  const { root, contract } = t.context.accounts;

  await root.call(contract, "mint", {
    reference: "QBR2hGdXIpDa_eYsnp0n3iiJFxd9IDcTKrzLDzWz6Ow",
    nft_contract_id: "",
  });

  t.is("Howdy", "Howdy");
});

// test("changes the message", async (t) => {
//   const { root, contract } = t.context.accounts;
//   await root.call(contract, "set_greeting", { message: "Howdy" });
//   const message: string = await contract.view("get_greeting", {});
//   t.is(message, "Howdy");
// });
