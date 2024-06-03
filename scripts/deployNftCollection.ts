import { beginCell, toNano, Address } from '@ton/core';
import { NftCollection } from '../wrappers/NftCollection';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    // Change to the content URL you prepared
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    // ===== Parameters =====
    // Replace owner with your address (if you use deeplink)
    let owner = provider.sender().address!;

    let collection = provider.open(
        await NftCollection.fromInit(
            owner,
            newContent, {
                $$type: "RoyaltyParams",
                numerator: 10n,
                denominator: 1000n,
                destination: owner,
            }
        )
    );

    // Do deploy
    await collection.send(
        provider.sender(),
        {
            value: toNano("0.1")
        },
        "Mint"
    );
    await provider.waitForDeploy(collection.address);

    // run methods on `collection`
}