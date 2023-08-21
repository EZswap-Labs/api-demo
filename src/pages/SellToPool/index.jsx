import {
  Button, Box, FormControl, InputLabel, Input, FormHelperText, Stack, Grid, Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { queryPoolListByPage } from '../../service/pool';
import NftTable from '../../components/NftTable';
import Header from '../../components/Header';

function BuyFromPool() {
  const [contractAddress, setContractAddress] = useState('0x2Fc83539F6299d3d7e88585EcBCbbC041db6fdDC');
  const [poolList, setPoolList] = useState([]);
  const chainId = useChainId();

  const getPoolList = async () => {
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
    }
    console.log('chainId', chainId);
    try {
      const res = await queryPoolListByPage({
        contractAddress,
        network,
      });
      const tempList = res?.data?.data?.filter((i) => i.fromPlatform === 1 && i.type !== 'sell');
      setPoolList(tempList);
    } catch (error) {
      console.log('error', error);
      setPoolList([]);
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
          <NftTable poolList={poolList} actionType="Sell" nftContractAddress={contractAddress} />
        </Grid>
      </Grid>

    </Box>
  );
}

export default BuyFromPool;
