import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, beginCell } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';
import '@ton/test-utils';

describe('NftCollection', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let nftCollection: SandboxContract<NftCollection>;

    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        nftCollection = blockchain.openContract(
            await NftCollection.fromInit(
                deployer.address,
                newContent, {
                    $$type: "RoyaltyParams",
                    numerator: 10n,
                    denominator: 1000n,
                    destination: deployer.address,
                }
            )
        );

        const deploy_result = await nftCollection.send(
            deployer.getSender(),
            {
                value: toNano(1)
            },
            "Mint"
        );
        expect(deploy_result.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            deploy: true,
            success: true,
        });
    });

    it("Test", async () => {
        console.log("Next IndexID: " + (await nftCollection.getGetCollectionData()).next_item_index);
        console.log("Collection Address: " + nftCollection.address);
    });

    it("should deploy correctly", async () => {
        const deploy_result = await nftCollection.send(deployer.getSender(), { value: toNano(1) }, "Mint"); // Send Mint Transaction
        expect(deploy_result.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            success: true,
        });

        console.log("Next IndexID: " + (await nftCollection.getGetCollectionData()).next_item_index);
    });
});
