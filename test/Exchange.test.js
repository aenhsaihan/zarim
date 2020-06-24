import { tokens, EVM_REVERT } from "./helpers";
import { iteratee } from "lodash";

const Exchange = artifacts.require("./Exchange");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("Exchange", ([deployer, feeAccount]) => {
  let exchange;

  beforeEach(async () => {
    exchange = await Exchange.new(feeAccount);
  });

  describe("deployment", () => {
    it("it tracks the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });
  });
});