'use strict';

const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    async RegisterVoter(ctx, voterHash, createdTime) {
        const exists = await this.AssetExists(ctx, voterHash);
        if (exists) {
            throw new Error(`The voter ${voterHash} already exists`);
        }
        const asset = {
            VoterHash: voterHash,
            CreatedTime: createdTime,
        };
        await ctx.stub.putState(voterHash, Buffer.from(stringify(sortKeysRecursive(asset))));
        console.log(`Successfully register voter with hash value "${voterHash}"`);
    }

    async ReadAsset(ctx, voterHash) {
        const assetJSON = await ctx.stub.getState(voterHash);
        return assetJSON.toString();
    }

    async AuthenticateVoter(ctx, voterHash) {
        const voter = await ctx.stub.getState(voterHash);
        if (!voter || voter.length === 0) {
            console.log('Voter not yet vote.');
            return true;
        }
        console.log('Voter already vote.')
        return false;
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

    async GetAssetHistory(ctx, voterHash) {

		let resultsIterator = await ctx.stub.getHistoryForKey(voterHash);
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

    async AssetExists(ctx, voterHash) {
        const assetJSON = await ctx.stub.getState(voterHash);
        return assetJSON && assetJSON.length > 0;
    }
}

module.exports = AssetTransfer;
