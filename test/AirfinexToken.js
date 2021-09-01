const AirfinexToken = artifacts.require("AirfinexToken");

const tokenName = "Airfinex";

const tokenSymbol = "AFX";

const totalSupply = 13130000000000000;

contract("AirfinexToken", (accounts) => {

    it("should has the token name 'Airfinex'", async () => {
        const tokenInstance = await AirfinexToken.deployed();
        const name = await tokenInstance.name();
        return assert.equal(name, tokenName, 'has the correct name');
    })

    it("should has the token symbol 'AFX'", async () => {
        const tokenInstance = await AirfinexToken.deployed();
        const symbol = await tokenInstance.symbol();
        return assert.equal(symbol, tokenSymbol, 'has the correct symbol');
    })

    it("should has the totalSupply is '13130000000000000'", async () => {
        const tokenInstance = await AirfinexToken.deployed();
        const totalSupply = await tokenInstance.totalSupply();
        return assert.equal(totalSupply, totalSupply, 'has the correct supply');
    })

    it("should allocates the totalSupply to owner", async () => {
        const tokenInstance = await AirfinexToken.deployed();
        const ownerBalance = await tokenInstance.balanceOf(accounts[0]);
        return assert.equal(ownerBalance, totalSupply, 'has allocated the totalSupply to the owner');
    })

    it('should transfers token ownership error', async () => {
        try {
            const tokenInstance = await AirfinexToken.deployed();
            await tokenInstance.transfer.call(accounts[1], 999999999999999);
        } catch (_error) {
            assert(_error.message.indexOf('revert') >= 0, 'error message must contains revert.')
        }
    })

    it('should transfers token ownership', async () => {
        const tokenInstance = await AirfinexToken.deployed();
        const tx = await tokenInstance.transfer(accounts[1], 10, { from: accounts[0] });

        assert.equal(tx.logs.length, 1, 'triggers one event');
        assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(tx.logs[0].args._from, accounts[0], 'log the account the token are transferred from');
        assert.equal(tx.logs[0].args._to, accounts[1], 'log the account the token are transferred to');
        assert.equal(tx.logs[0].args._value, 10, 'log the transfer amount');

        const senderBalance = await tokenInstance.balanceOf(accounts[0]);
        const receiverBalance = await tokenInstance.balanceOf(accounts[1]);
        assert.equal(receiverBalance, 10, 'adds the amount from the receiving account')
        assert.equal(senderBalance, totalSupply - 10, 'deduct the amount from the sending account')

        const success = await tokenInstance.transfer.call(accounts[1], 10);
        assert.equal(success, true, 'should return the bool true')

    })

    it('handles delegated token transfers', async () => {
        const tokenInstance = await AirfinexToken.deployed();

        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4];

        await tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });

        await tokenInstance.approve(spendingAccount, 50, { from: fromAccount });

        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 1000, { from: spendingAccount });
        } catch (_err) {
            assert(_err.message.indexOf('revert') >= 0, 'cannot transfer the value large than then balance')
        }

        try {
            await tokenInstance.transferFrom(fromAccount, toAccount, 60, { from: spendingAccount });
        } catch (_err) {
            assert(_err.message.indexOf('revert') >= 0, 'cannot transfer the value large than the approved balance')
        }

        let success = false;
        try {
           success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 40, { from: spendingAccount });
        } catch (_err) {
            assert(_err.message.indexOf('revert') < 0, 'cannot transfer the value large than the approved balance')
        }
        assert.equal(success, true, 'should return the success bool true');

        const tx = await tokenInstance.transferFrom(fromAccount, toAccount, 40, { from: spendingAccount });
        assert.equal(tx.logs.length, 1, 'triggers one event');
        assert.equal(tx.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(tx.logs[0].args._from, fromAccount, 'log the account the token are transferred from');
        assert.equal(tx.logs[0].args._to, toAccount, 'log the account the token are transferred to');
        assert.equal(tx.logs[0].args._value, 40, 'log the transfer amount');
        
        const senderBalance = await tokenInstance.balanceOf(fromAccount);
        const receiverBalance = await tokenInstance.balanceOf(toAccount);
        assert.equal(receiverBalance.toNumber(), 40, 'adds the amount from the receiving account')
        assert.equal(senderBalance.toNumber(), 60, 'deduct the amount from the sending account')

        const allowanceBalance = await tokenInstance.allowance(fromAccount, spendingAccount);
        assert.equal(allowanceBalance.toNumber(), 10, 'reduce the allowance of the account')
    })

    it('approves the token for delegated transfers', async () => {
        const tokenInstance = await AirfinexToken.deployed();

        const success = await tokenInstance.approve.call(accounts[1], 100);
        assert.equal(success, true, 'should return the bool true')

        const tx = await tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        assert.equal(tx.logs.length, 1, 'triggers one event');
        assert.equal(tx.logs[0].event, 'Approval', 'should be the "Approval" event');
        assert.equal(tx.logs[0].args._owner, accounts[0], 'log the account the token are authorized by');
        assert.equal(tx.logs[0].args._spender, accounts[1], 'log the account the token are authorized to');
        assert.equal(tx.logs[0].args._value, 100, 'log the transfer amount');

        const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfers');
    })
})