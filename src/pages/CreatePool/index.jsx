import {
  FormControl, FormLabel, RadioGroup, Radio, Grid, TextField,
  FormControlLabel, Button, Box, Stack, Typography,
} from '@mui/material';
import ReactJson from 'react-json-view';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAccount, useChainId } from 'wagmi';
import mathLib from 'ezswap_math';
import { toast } from 'react-toastify';
import { ethers, utils } from 'ethers';
import Header from '../../components/Header';
import {
  createPair, setApproval, approveToken, allowanceToken,
} from '../../toolkit/transaction';

const myJsonObject = {
  priceData: {
    delta: 0.1,
    spotPrice: 1,
    userSellPrice: 0.994,
    poolBuyPrice: 0.997,
    poolBuyPriceFee: 0.003,
    userSellPriceFee: 0.006,
  },
  currentPrice: { userSellPrice: 0.994 },
  nextPrice: { userSellPrice: 0.8945999999999998 },
};
const initialValues = {
  startPrice: 1,
  spotPrice: 1,
  delta: 0.1,
  fee: 0,
  protocolFee: 0.001,
  projectFee: 0,
  buyNftCount: 1,
  sellNftCount: 1,
  action: 'create',
  model: 'Linear',
  poolType: 'buy',
  tokenType: 'ERC721',
  collectionAddress: '0x8e81970ceb63c236534a763c0ecb611d2d16189f',
  tokenAddress: '0x4Cc56c5A7F3030497FFDA610C7fb51e462b2DEbA',
  tokenId: 1,
  initialTokenBalance: 100,
};

const getPriceData = ({
  spotPrice, delta, fee, protocolFee, projectFee, startPrice,
  buyNftCount, sellNftCount, model, action, poolType,
}) => {
  try {
    let buyPriceData;
    let sellPriceData;
    // let deltaTemp = delta;
    // if (model === 'Exponential') {
    //   deltaTemp += 1;
    // }
    console.log('delta', delta);
    if (poolType === 'buy' || poolType === 'trade') {
      buyPriceData = mathLib?.[model]?.[poolType](
        startPrice,
        delta,
        fee,
        protocolFee,
        projectFee,
        buyNftCount,
        action,
      );
    }
    if (poolType === 'sell' || poolType === 'trade') {
      sellPriceData = mathLib?.[model]?.[poolType](
        startPrice,
        delta,
        fee,
        protocolFee,
        projectFee,
        sellNftCount,
        action,
      );
    }
    return {
      buyPriceData,
      sellPriceData,
    };
  } catch (error) {
    console.log('error', error);
    return {};
  }
};

const curveAddressMap = {
  '0x05': {
    Exponential: '0x29049b09299fE2A874a64927F172392a94f2a801',
    Linear: '0x59B0a72Dab61Db40b7a4ca68886D4c3666706104',
  },
  '0x89': {
    Exponential: '0x20C318AA7c2eC1190F20D41EB6C6F3Ec9f5955fe',
    Linear: '0x9Be2Dc731bFf38B0a5D893c7a5ECE8e170c67b86',
  },
  '0x0118': {
    Exponential: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
    Linear: '0x4f639fE811181E9e11269fb66ffC9308de9A9Cd5',
  },
};
const CollectionAddress = {
  '0x05': {
    ERC20: '0x05fdbac96c17026c71681150aa44cbd0dddd3374',
    ERC721: '0x05fdbac96c17026c71681150aa44cbd0dddd3374',
    ERC1155: '0x4f639fE811181E9e11269fb66ffC9308de9A9Cd5',
  },
  '0x89': {
    ERC20: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
    ERC721: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
    ERC1155: '0x4f639fE811181E9e11269fb66ffC9308de9A9Cd5',
  },
  '0x0118': {
    ERC20: '0x2Fc83539F6299d3d7e88585EcBCbbC041db6fdDC',
    ERC721: '0x2Fc83539F6299d3d7e88585EcBCbbC041db6fdDC',
    ERC1155: '0xe76E5d203f453EEE315e954CdB98a7caae67691a',
  },
};

const poolTypeMap = {
  buy: 0,
  sell: 1,
  trade: 2,
};

function CreatePool() {
  const { address } = useAccount();
  const [priceJson, setPriceJson] = useState(myJsonObject);
  const [deposit, setDeposit] = useState(0);
  const [receive, setReceive] = useState(0);
  const chainId = useChainId();
  const formik = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (!address) {
        toast.error('user address empty');
        return;
      }
      if (!values?.collectionAddress) {
        toast.error('collectionAddress empty');
        return;
      }
      if (!values?.startPrice) {
        toast.error('startPrice empty');
        return;
      }
      const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
      let total = '0';
      let delta = 0;

      const priceData = getPriceData(formik?.values);
      const { poolType = 'buy' } = formik.values || {};
      if (poolType === 'buy') {
        delta = priceData?.buyPriceData?.priceData?.delta;
      }
      if (poolType === 'sell') {
        delta = priceData?.sellPriceData?.priceData?.delta;
      }
      if (poolType === 'trade') {
        delta = priceData?.sellPriceData?.priceData?.delta
        || priceData?.buyPriceData?.priceData?.delta;
      }
      console.log('delta', delta);
      console.log('delta', utils.parseEther(delta?.toString()));
      const params = [
        values?.collectionAddress, // NFT地址
        curveAddressMap[chainIdHex]?.[values?.model], // 价格模型地址
        values.poolType === 'trade' ? '0x0000000000000000000000000000000000000000' : address, // assetRecipient
        poolTypeMap?.[values.poolType], // buy: 0, sell: 1, trade: 2,
        utils.parseEther(delta?.toString()),
        utils.parseEther(values?.fee?.toString()), // fee 只有trade池子才有
        utils.parseEther(values?.spotPrice?.toString()), // 开始价格
        [], // initialNFTIDs
      ];
      if (values?.poolType === 'buy') {
        total = deposit.toString();
      } else {
        params[7] = [parseInt(values?.nftIds, 10)]; // tokenId
      }
      if (values?.tokenType === 'ERC1155') {
        if (!(values?.tokenId) && values?.tokenId !== 0) {
          toast.error('tokenId empty');
          return;
        }
        params[7] = parseInt(values?.tokenId, 10); // tokenId
        params[8] = values?.poolType === 'buy' ? 0 : values?.sellNftCount; // 卖的个数
      }
      if (values?.tokenType === 'ERC20') {
        console.log('ERC20');
        // 第一位
        params.splice(0, 0, values?.tokenAddress);
        // 后面
        const amount = utils.parseEther(values?.initialTokenBalance?.toString());
        params.push(amount);

        // 判断是否已经 approve
        console.log('ERC202');
        const allowanceAmount = await allowanceToken({
          tokenAddress: values?.tokenAddress,
          userAddress: address,
          chainId: chainIdHex,
        });
        console.log('allowanceAmount', allowanceAmount);
        if (allowanceAmount < values?.initialTokenBalance) {
          await approveToken({
            tokenAddress: values?.tokenAddress,
            amount,
            chainId: chainIdHex,
          });
        }
      } else {
        params.push({ value: utils.parseEther(total) });
      }
      console.log('params', params);
      createPair({ tokenType: values?.tokenType, params, chainId: chainIdHex });
    },
  });

  useEffect(() => {
    const priceData = getPriceData(formik?.values);
    setPriceJson(priceData);
    const { poolType = 'buy' } = formik.values || {};
    if (poolType === 'buy') {
      setReceive(0);
      setDeposit(priceData?.buyPriceData?.priceData?.poolBuyPrice);
    }
    if (poolType === 'sell') {
      setReceive(priceData?.sellPriceData?.priceData?.poolSellPrice);
      setDeposit(0);
    }
    if (poolType === 'trade') {
      setReceive((priceData?.sellPriceData?.priceData?.poolSellPrice || 0)
        + (priceData?.sellPriceData?.priceData?.poolSellPriceFee || 0));
      setDeposit((priceData?.buyPriceData?.priceData?.poolBuyPrice || 0)
        + (priceData?.buyPriceData?.priceData?.poolBuyPriceFee || 0));
    }
  }, [formik?.values]);

  useEffect(() => {
    const { poolType = 'buy' } = formik.values || {};
    const priceData = getPriceData(formik?.values);
    if (poolType === 'buy') {
      formik.setFieldValue('spotPrice', priceData?.buyPriceData?.priceData?.spotPrice);
    }
    if (poolType === 'sell') {
      formik.setFieldValue('spotPrice', priceData?.sellPriceData?.priceData?.spotPrice);
    }
    if (poolType === 'trade') {
      formik.setFieldValue('spotPrice', priceData?.sellPriceData?.priceData?.spotPrice || priceData?.buyPriceData?.priceData?.spotPrice);
    }
  }, [priceJson]);

  useEffect(() => {
    console.log('chainId', ethers.BigNumber.from(chainId).toHexString());
    formik.setFieldValue('collectionAddress', CollectionAddress[ethers.BigNumber.from(chainId).toHexString()][formik.values.tokenType]);
  }, [chainId, formik.values.tokenType]);

  return (
    <Box sx={{ my: 2 }}>
      <Header />
      <Grid container p={4}>
        <Grid item xs={12}>
          <FormControl onSubmit={formik.handleSubmit}>
            <Stack flexDirection="row">
              <FormLabel sx={{ my: 2, mx: 2 }} id="demo-controlled-radio-buttons-group">tokenType</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="tokenType"
                value={formik.values.tokenType}
                onChange={formik.handleChange}
              >
                <FormControlLabel value="ERC20" control={<Radio />} label="ERC20" />
                <FormControlLabel value="ERC721" control={<Radio />} label="ERC721" />
                <FormControlLabel value="ERC1155" control={<Radio />} label="ERC1155" />
              </RadioGroup>
              <FormLabel sx={{ my: 2, mx: 2 }} id="demo-controlled-radio-buttons-group">model</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="model"
                value={formik.values.model}
                onChange={formik.handleChange}
              >
                <FormControlLabel value="Linear" control={<Radio />} label="Linear" />
                <FormControlLabel value="Exponential" control={<Radio />} label="Exponential" />
              </RadioGroup>
              <FormLabel sx={{ my: 2, mx: 2 }} id="demo-controlled-radio-buttons-group">poolType</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="poolType"
                value={formik.values.poolType}
                onChange={formik.handleChange}
              >
                <FormControlLabel value="buy" control={<Radio />} label="buy" />
                <FormControlLabel value="sell" control={<Radio />} label="sell" />
                <FormControlLabel value="trade" control={<Radio />} label="trade" />
              </RadioGroup>
              <FormLabel sx={{ my: 2, mx: 2 }} id="demo-controlled-radio-buttons-group">action</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="action"
                value={formik.values.action}
                onChange={formik.handleChange}
              >
                <FormControlLabel value="create" control={<Radio />} label="create" />
              </RadioGroup>
            </Stack>
            <Stack flexDirection="row">
              <TextField
                type="number"
                value={formik.values.startPrice}
                onChange={formik.handleChange}
                name="startPrice"
                label="startPrice"
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
              <TextField
                type="number"
                disabled
                value={formik.values.spotPrice}
                name="spotPrice"
                label="spotPrice"
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
              <TextField
                type="number"
                value={formik.values.delta}
                onChange={formik.handleChange}
                name="delta"
                label={formik.values.model === 'Exponential' ? 'delta(%)' : 'delta'}
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
              {formik.values.poolType === 'trade'
                ? (
                  <TextField
                    type="number"
                    value={formik.values.fee}
                    onChange={formik.handleChange}
                    name="fee"
                    label="fee"
                    variant="outlined"
                    sx={{ my: 2, mx: 2 }}
                  />
                ) : null}
              <TextField
                type="number"
                value={formik.values.protocolFee}
                onChange={formik.handleChange}
                name="protocolFee"
                label="protocolFee"
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
              <TextField
                type="number"
                value={formik.values.projectFee}
                onChange={formik.handleChange}
                name="projectFee"
                label="projectFee"
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
            </Stack>
            <Stack flexDirection="row">
              <TextField
                type="text"
                value={formik.values.collectionAddress}
                onChange={formik.handleChange}
                name="collectionAddress"
                label="collectionAddress"
                variant="outlined"
                sx={{ my: 2, mx: 2 }}
              />
              {formik.values.tokenType === 'ERC20' ? (
                <>
                  <TextField
                    type="text"
                    value={formik.values.tokenAddress}
                    onChange={formik.handleChange}
                    name="tokenAddress"
                    label="tokenAddress"
                    variant="outlined"
                    sx={{ my: 2, mx: 2 }}
                  />
                  <TextField
                    type="text"
                    value={formik.values.initialTokenBalance}
                    onChange={formik.handleChange}
                    name="initialTokenBalance"
                    label="initialTokenBalance"
                    variant="outlined"
                    sx={{ my: 2, mx: 2 }}
                  />
                </>
              ) : null}
              {formik.values.tokenType === 'ERC1155' ? (
                <TextField
                  type="text"
                  value={formik.values.tokenId}
                  onChange={formik.handleChange}
                  name="tokenId"
                  label="tokenId"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}
              {formik.values.poolType !== 'buy' && formik.values.tokenType !== 'ERC1155' ? (
                <TextField
                  type="text"
                  value={formik.values.nftIds}
                  onChange={formik.handleChange}
                  name="nftIds"
                  label="nftIds"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}
              {formik.values.poolType !== 'sell' ? (
                <TextField
                  type="number"
                  value={formik.values.buyNftCount}
                  onChange={formik.handleChange}
                  name="buyNftCount"
                  label="buyNftCount"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}
              {formik.values.poolType !== 'buy' ? (
                <TextField
                  type="number"
                  value={formik.values.sellNftCount}
                  onChange={formik.handleChange}
                  name="sellNftCount"
                  label="sellNftCount"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}
            </Stack>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            Price data:
          </Typography>
          <ReactJson src={priceJson} theme="monokai" />
        </Grid>
        <Grid item xs={6}>
          {formik?.values?.tokenType !== 'ERC20' ? (
            <>
              <Typography sx={{ my: 2, mx: 2 }}>
                deposit:
                {deposit}
                ETH
              </Typography>
              <Typography sx={{ my: 2, mx: 2 }}>
                receive:
                {receive}
                ETH
              </Typography>
            </>
          ) : null}
          <Button
            variant="contained"
            sx={{ m: 2 }}
            onClick={() => {
              formik.submitForm();
            }}
          >
            Create Pool
          </Button>
          {formik?.values?.poolType !== 'buy' ? (
            <Button
              variant="contained"
              sx={{ m: 2 }}
              onClick={() => {
                const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
                setApproval({
                  nftContractAddress: formik.values.collectionAddress,
                  chainId: chainIdHex,
                });
              }}
            >
              approve
            </Button>
          ) : null}
          {
            formik?.values?.poolType !== 'buy'
              ? (
                <Typography sx={{ my: 2, mx: 2 }}>
                  explain:
                  <Typography sx={{ my: 2 }}>
                    1. you should approve NFT to contract
                  </Typography>
                  <Typography sx={{ my: 2 }}>
                    2. fill the nftIds you have (nftIds.length = sellNftCount)
                  </Typography>
                  <Typography sx={{ my: 2 }}>
                    3. in ERC1155 pool nftIds just have 1 --- (tokenId)
                  </Typography>
                </Typography>
              )
              : null
          }
          <Typography sx={{ my: 2, mx: 2 }}>
            NFT contract :
            {
              CollectionAddress
                ?.[ethers.BigNumber.from(chainId).toHexString()]
                ?.[formik.values.tokenType]
            }
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CreatePool;
