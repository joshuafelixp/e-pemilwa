'use strict';

const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    async CreateVote(ctx, voteID, voteHash, createdTime) {
        const exists = await this.AssetExists(ctx, voteID);
        if (exists) {
            throw new Error(`The vote ${voteID} already exists`);
        }
        const asset = {
            VoteID: voteID,
            VoteHash: voteHash,
            CreatedTime: createdTime,
        };
        await ctx.stub.putState(voteID, Buffer.from(stringify(sortKeysRecursive(asset))));
        console.log(`Successfully create vote with id "${voteID}"`);
    }

    async ReadAsset(ctx, voteID) {
        const assetJSON = await ctx.stub.getState(voteID);
        return assetJSON.toString();
    }

    async GetAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async GetAssetHistory(ctx, voteID) {

		let resultsIterator = await ctx.stub.getHistoryForKey(voteID);
		let results = await this._GetAllResults(resultsIterator, true);

		return JSON.stringify(results);
	}

    async _GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.txId;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}

    async AssetExists(ctx, voteID) {
        const assetJSON = await ctx.stub.getState(voteID);
        return assetJSON && assetJSON.length > 0;
    }
}

module.exports = AssetTransfer;
