import { ethers } from 'ethers';
import {
  Button, Box, FormControl, InputLabel, Input, FormHelperText, Stack, Grid,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { queryPoolListByPage } from '../../service/pool';
import NftTable from '../../components/NftTable';
import Header from '../../components/Header';
import queryABI from '../../ABI/queryABI.json';

function BuyFromPool() {
  // 0xf8e23bc73bba99d3f3e40a4372ed7de52b004bdb
  const [contractAddress, setContractAddress] = useState('0xb02074A8f4A59a03C815980560B5D8d1db4c2145');
  // 0x70a3fd679762eafd655d293cb8b4a76c11a4da4a
  const [poolList, setPoolList] = useState([]);
  const chainId = useChainId();
  const getPoolList = async () => {
    console.log('chainId', chainId);
    let network = 'dev';
    if (chainId === 280) {
      network = 'zks_dev';
    } else if (chainId === 137) {
      network = 'polygon';
    } else if (chainId === 80001) {
      network = 'Mumbai';
    } else if (chainId === 42161) {
      network = 'arbone';
    } else if (chainId === 421613) {
      network = 'arbgoerli';
    } else if (chainId === 3441005) {
      network = 'mantatest';
    } else if (chainId === 169) {
      network = 'manta';
    } else if (chainId === 2970385) {
      const provider = new ethers.providers.Web3Provider(window?.ethereum);
      const eventSignature = '0xf5bdc103c3e68a20d5f97d2d46792d3fdddfa4efeb6761f8141e6a7b936ca66c';
      const latestBlock = await provider.getBlockNumber();
      const filter = {
        fromBlock: 711850,
        toBlock: latestBlock,
        address: '0x6D4dD244BEFAfE26274f206E8eee5a7dbe72bFfE',
        topics: [eventSignature],
      };
      const logs = await provider.getLogs(filter);
      let totalPoolAddress = [];
      totalPoolAddress = logs.map((log) => `0x${log.data.slice(-40)}`);
      totalPoolAddress = totalPoolAddress.slice(-5);

      const contract = new ethers.Contract(
        '0x53E1CFAa4a05b2b960969DFBb298278b2222db0D',
        queryABI,
        provider,
      );
      const poolInformation = await contract.getMultiInfo(totalPoolAddress);

      const queryData = [];
      for (let i = 0; i < poolInformation.length;) {
        let type;
        if (poolInformation[i].poolType === 0) {
          type = 'buy';
        } else if (poolInformation[i].poolType === 1) {
          type = 'sell';
        } else if (poolInformation[i].poolType === 2) {
          type = 'trade';
        }
        console.log(poolInformation[i].poolType);

        let bondingCurve;
        if (
          poolInformation[i].bondingCurve
          === '0xB32eFC47Bf503B3593a23204cF891295a85115Ea'
        ) {
          bondingCurve = 'Linear';
        } else if (
          poolInformation[i].bondingCurve
          === '0xE567f07cD4aeC9AEDD8A54E4F2A4d24de204eB98'
        ) {
          bondingCurve = 'Exponential';
        }

        let tokenBalance;
        let ethBalance;
        if (
          poolInformation[i].token === '0x0000000000000000000000000000000000000000'
        ) {
          ethBalance = poolInformation[i].tokenBalance.toString();
          tokenBalance = null;
        } else {
          ethBalance = null;
          tokenBalance = poolInformation[i].tokenBalance.toString();
        }

        const data = {
          id: totalPoolAddress[i],
          collection: poolInformation[i].collection,
          owner: poolInformation[i].owner,
          token: poolInformation[i].token,
          type,
          assetRecipient: poolInformation[i].assetRecipient,
          bondingCurve,
          delta: poolInformation[i].delta.toString(),
          fee: poolInformation[i].fee.toString(),
          spotPrice: poolInformation[i].spotPrice.toString(),
          nftIds: poolInformation[i].nftIds.map((bn) => bn.toString()),
          ethBalance,
          tokenBalance,
          ethVolume: '0',
          createTimestamp: i,
          updateTimestamp: i,
          nftCount: poolInformation[i].nftCount.toString(),
          fromPlatform: 1,
          protocolFee: ethers.utils.parseEther('0.005').toString(),
          is1155: poolInformation[i].is1155,
          nftId1155: poolInformation[i].nftId1155.toString(),
          nftCount1155: poolInformation[i].nftCount1155.toString(),
        };
        queryData.push(data);
        i += 1;
      }
      console.log(queryData);
      const lastData = queryData.filter((data) => data.collection === contractAddress && data.type !== 'buy' && data.nftCount > 0);
      setPoolList(lastData);
    }

    if (chainId !== 2970385) {
      try {
        const res = await queryPoolListByPage({
          contractAddress,
          network,
        });
        const tempList = res?.data?.data?.filter((i) => i.fromPlatform === 1 && i.type !== 'buy');
        console.log('tempList', tempList);
        setPoolList(tempList);
      } catch (error) {
        console.log('error', error);
        setPoolList([]);
      }
    }
  };

  useEffect(() => {
    getPoolList();
  }, [chainId]);

  return (
    <Box sx={{ my: 2 }}>
      <Header />
      <Grid container>
        <Grid item md={12}>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              m: 4,
            }}
          >
            <FormControl sx={{ width: 400 }}>
              <InputLabel htmlFor="my-input">contract address</InputLabel>
              <Input
                id="my-input"
                aria-describedby="my-helper-text"
                value={contractAddress}
                onChange={(e) => {
                  setContractAddress(e?.target?.value);
                }}
              />
            </FormControl>
            <Button
              sx={{
                width: 200,
                mt: 2,
              }}
              variant="contained"
              onClick={async () => {
                getPoolList();
              }}
            >
              get PoolList

            </Button>
          </Stack>
        </Grid>

        <Grid item md={12} sx={{ m: 4 }}>
          <NftTable poolList={poolList} nftContractAddress={contractAddress} />
        </Grid>
      </Grid>

    </Box>
  );
}

export default BuyFromPool;
