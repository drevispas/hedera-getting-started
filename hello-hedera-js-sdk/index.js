require('dotenv').config();
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction
} = require("@hashgraph/sdk");

async function environmentSetup() {

  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;
  if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables are not set");
  }
  console.log(`myAccountId: ${myAccountId}`);

  /* Create a Hedera client. */
  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);
  client.setDefaultMaxTransactionFee(new Hbar(100));
  client.setMaxQueryPayment(new Hbar(50));

  /* Create a demo account. */
  const newAccountSK = PrivateKey.generateED25519();
  const newAccountPK = newAccountSK.publicKey;
  console.log(`newAccountPK: ${newAccountPK}`);
  const newAccount = await new AccountCreateTransaction()
  .setKey(newAccountPK)
  .setInitialBalance(Hbar.fromTinybars(1000))
  .execute(client);
  const receipt = await newAccount.getReceipt(client);
  const newAccountId=receipt.accountId;
  console.log(`newAccountId: ${newAccountId}`);

  /* Query the new account balance */
  const newAccountBalance = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .execute(client);
  console.log(`New account balance: ${newAccountBalance}`);

  /* Transfer the new account HBAR. */
  const sendHbar = await new TransferTransaction()
  .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
  .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
  .execute(client);
  const sendReceipt = await sendHbar.getReceipt(client);
  console.log(`Transfer status: ${sendReceipt.status.toString()}`);

  /* Query the cost of a query (free) */
  const queryCost = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .getCost(client);
  console.log(`The cost of balance query: ${queryCost}`);

  /* Query the new account balance */
  const updatedNewAccountBalance = await new AccountBalanceQuery()
  .setAccountId(newAccountId)
  .execute(client);
  console.log(`Updated new account balance: ${updatedNewAccountBalance}`);

  /* Close the client conenction. */
  client.close();
}

environmentSetup();
