import { tokens, EVM_REVERT } from "./helpers";

const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Exchange", ([deployer, feeAccount, user1]) => {
  let exchange, token, amount;
  const feePercent = 10;

  beforeEach(async () => {
    token = await Token.new();
    token.transfer(user1, tokens(100, { from: deployer }));

    exchange = await Exchange.new(feeAccount, feePercent);
  });

  describe("deployment", () => {
    it("it tracks the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });

    it("it tracks the fee percent", async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
  });

  describe("depositing tokens", () => {
    describe("success", () => {
      let result, amount;

      beforeEach(async () => {
        amount = tokens(10);
        result = await token.approve(exchange.address, amount, {
          from: user1,
        });

        result = await exchange.depositToken(token.address, amount, {
          from: user1,
        });
      });

      it("tracks the token deposit", async () => {
        let balance;
        // check exchange's token balance
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        // check token balance on exchange
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });
    });

    describe("failure", () => {
      it("rejects unapproved transfers", async () => {
        await exchange.depositToken(token.address, amount, {
          from: deployer,
        }).should.be.rejected;
      });
    });
  });
});
