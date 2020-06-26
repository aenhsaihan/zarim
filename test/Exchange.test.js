import { tokens, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

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
      let result, amount, balance;

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
        // check exchange's token balance
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        // check token balance on exchange
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });

      it("emits a Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Deposit");
        const event = log.args;
        event.token.should.equal(token.address, "token is not correct");
        event.user.toString().should.equal(user1, "user is not correct");
        event.amount
          .toString()
          .should.equal(amount.toString(), "amount is not correct");
        event.balance
          .toString()
          .should.equal(balance.toString(), "balance is not correct");
      });
    });

    describe("failure", () => {
      it("rejects ether deposits", async () => {
        await exchange
          .depositToken(ETHER_ADDRESS, tokens(10), {
            from: user1,
            value: tokens(10),
          })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("rejects unapproved transfers", async () => {
        await exchange
          .depositToken(token.address, tokens(10), {
            from: user1,
          })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("depositing ether", () => {
    let result, amount, balance;

    beforeEach(async () => {
      amount = tokens(10);
      result = await exchange.depositEther({
        from: user1,
        value: amount,
      });
    });

    describe("success", async () => {
      it("deposits ether", async () => {
        balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal(amount.toString());
      });
    });

    describe("failure", async () => {
      it.skip("should reject incorrect deposit", async () => {
        await exchange
          .depositEther(amount, {
            from: user1,
          })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });
});
