import {
  FormControl, FormLabel, RadioGroup, Radio, Grid, TextField,
  FormControlLabel, Button, Box, Stack, Typography, Divider,
} from '@mui/material';
import ReactJson from 'react-json-view';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useAccount, useChainId } from 'wagmi';
import mathLib from 'ezswap_math';
import { toast } from 'react-toastify';
import { ethers, utils, constants } from 'ethers';
import Header from '../../components/Header';
import {
  createPair, setApproval, approveToken, allowanceToken, createV2Pair,
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
  delta: 0,
  fee: 0,
  protocolFee: 0.01,
  projectFee: 0,
  buyNftCount: 1,
  sellNftCount: 0,
  action: 'create',
  model: 'Linear',
  poolType: 'buy',
  tokenType: 'ERC721',
  ttttype: 'ERC721-NativeToken',
  collectionAddress: '0x8e81970ceb63c236534a763c0ecb611d2d16189f',
  tokenAddress: '0xFBD152E487A8d5c638365357F6bdfa197C150992',
  tokenId: 1,
  initialTokenBalance: 10,
  nftIds: [],
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
    Linear: '0x59B0a72Dab61Db40b7a4ca68886D4c3666706104',
    Exponential: '0x29049b09299fE2A874a64927F172392a94f2a801',
  },
  '0x89': {
    Linear: '0x9Be2Dc731bFf38B0a5D893c7a5ECE8e170c67b86',
    Exponential: '0x20C318AA7c2eC1190F20D41EB6C6F3Ec9f5955fe',
  },
  '0x0118': {
    Linear: '0x4f639fE811181E9e11269fb66ffC9308de9A9Cd5',
    Exponential: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
  },
  '0x013881': {
    Linear: '0x9Be2Dc731bFf38B0a5D893c7a5ECE8e170c67b86',
    Exponential: '0x20C318AA7c2eC1190F20D41EB6C6F3Ec9f5955fe',
  },
  '0xa4b1': {
    Linear: '0x9Be2Dc731bFf38B0a5D893c7a5ECE8e170c67b86',
    Exponential: '0x20C318AA7c2eC1190F20D41EB6C6F3Ec9f5955fe',
  },
  '0x066eed': {
    Linear: '0xD7d30a3069E034558e2639325EB89f87E4fCB001',
    Exponential: '0xe87a7986Dc758f44E15B8eb5cA3C86Ccb49d1512',
  },
  '0x2d5311': {
    Linear: '0xB32eFC47Bf503B3593a23204cF891295a85115Ea',
    Exponential: '0xE567f07cD4aeC9AEDD8A54E4F2A4d24de204eB98',
  },
  '0x34816d': {
    Linear: '0xE567f07cD4aeC9AEDD8A54E4F2A4d24de204eB98',
    Exponential: '0x75f155c8F3AF789Ea05A1061467476b216F9102b',
  },
  '0xa9': {
    Linear: '0x9Be2Dc731bFf38B0a5D893c7a5ECE8e170c67b86',
    Exponential: '0x20C318AA7c2eC1190F20D41EB6C6F3Ec9f5955fe',
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
  '0x013881': {
    ERC20: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
    ERC721: '0xE8F6631a16F90383A1C956114EB30B8c3705e947',
    ERC1155: '0x4f639fE811181E9e11269fb66ffc938de9A9Cd5',
  },
  '0xa4b1': {
    ERC20: '0xd3e02292A7730560a1BaC2207642864A5F332C0c',
    ERC721: '0xB32eFC47Bf503B3593a23204cF891295a85115Ea',
    ERC1155: '0x4f639fE811181E9e11269fb66ffc938de9A9Cd5',
  },
  '0x066eed': {
    ERC20: '0xFBD152E487A8d5c638365357F6bdfa197C150992',
    ERC721: '0xEd3671491160F711cE9C56F9596c45294f3F049a',
    ERC1155: '0xf6f562Da11e38d905e6eEA9c2FF6Ae716135BaC9',
  },
  '0x2d5311': {
    ERC20: '0x0eA28A599d162c7776B1c920914B425Ce6E33bC3',
    ERC721: '0xb02074A8f4A59a03C815980560B5D8d1db4c2145',
    ERC1155: '0x6baFf0EcD4390F6F75C6b37a8EFf2550cBdF9846',
  },
  '0x34816d': {
    ERC20: '0x0B20E82DAC9dCc7b9D082C2Abb32AEf2D33a42D6',
    ERC721: '0xB0CCEC418B8c5606EED44ecCf83E7932893E1105',
    ERC1155: '0xd48Aa2a392A1c6253D88728e20d20f0203F8838c',
  },
  '0xa9': {
    ERC20: '0xB32eFC47Bf503B3593a23204cF891295a85115Ea',
    ERC721: '0xE567f07cD4aeC9AEDD8A54E4F2A4d24de204eB98',
    ERC1155: '0x7e19ae65b9DE48C09eAdFdF0e4Be2CF977eE63b3',
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
        params[7] = values?.nftIds;
        // params[7] = [parseInt(values?.nftIds, 10)]; // nftIds
      }

      if (values?.ttttype === 'ERC721-NativeToken' || values?.ttttype === 'ERC721-ERC20') {
        if (values?.ttttype === 'ERC721-ERC20') {
          console.log('ERC20');
          // 第一位
          params.splice(0, 0, values?.tokenAddress);
          // 后面
          const amount = utils.parseEther(values?.initialTokenBalance?.toString());
          params.push(amount);
          // 判断是否已经 approve
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
        } else if (values?.ttttype === 'ERC721-NativeToken') {
          params.push({ value: utils.parseEther(total) });
        }
      } else if (values?.ttttype === 'ERC1155-NativeToken' || values?.ttttype === 'ERC1155-ERC20') {
        if (!(values?.tokenId) && values?.tokenId !== 0) {
          toast.error('tokenId empty');
          return;
        }
        params[7] = parseInt(values?.tokenId, 10); // nftId
        params[8] = values?.poolType === 'buy' ? 0 : values?.sellNftCount; // 卖的个数

        if (values?.ttttype === 'ERC1155-ERC20') {
          // 第一位
          params.splice(0, 0, values?.tokenAddress);
          // 后面
          const amount = utils.parseEther(values?.initialTokenBalance?.toString());
          params.push(amount);
          // 判断是否已经 approve
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
        } else if (values?.ttttype === 'ERC1155-NativeToken') {
          params.push({ value: utils.parseEther(total) });
        }
      }

      console.log('params', params);
      createV2Pair({ ttttype: values?.ttttype, params, chainId: chainIdHex });
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
    if (formik?.values?.ttttype === 'ERC721-ERC20' || formik?.values?.ttttype === 'ERC721-NativeToken') {
      formik.setFieldValue('collectionAddress', CollectionAddress[ethers.BigNumber.from(chainId).toHexString()].ERC721);
    } else {
      formik.setFieldValue('collectionAddress', CollectionAddress[ethers.BigNumber.from(chainId).toHexString()].ERC1155);
    }
    if (formik?.values?.ttttype === 'ERC721-ERC20' || formik?.values?.ttttype === 'ERC1155-ERC20') {
      formik.setFieldValue('tokenAddress', CollectionAddress[ethers.BigNumber.from(chainId).toHexString()].ERC20);
    }
  }, [chainId, formik.values.ttttype]);

  const options = [
    { value: 'ERC721-NativeToken', label: 'ERC721-NativeToken' },
    { value: 'ERC721-ERC20', label: 'ERC721-ERC20' },
    { value: 'ERC1155-NativeToken', label: 'ERC1155-NativeToken' },
    { value: 'ERC1155-ERC20', label: 'ERC1155-ERC20' },
  ];
  return (
    <Box sx={{ my: 2 }}>
      <Header />
      <Grid container p={4}>
        <Grid item xs={12}>
          <FormControl onSubmit={formik.handleSubmit}>

            <Divider />
            {/* // 1 Select pool type */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '2xl' }}>1 Select pool type</Typography>
            <Stack flexDirection="row" sx={{ my: 4, mx: 2 }}>
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
            </Stack>

            <Divider />
            {/* // 2 slect ttttype and approve collection and token */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '2xl' }}>2 Select token pair type and approve collection and token</Typography>
            <Stack flexDirection="row" sx={{ my: 4, mx: 2 }}>
              <FormLabel sx={{ my: 2, mx: 2 }} id="demo-controlled-radio-buttons-group">ttttype</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="ttttype"
                value={formik.values.ttttype}
                onChange={formik.handleChange}
              >
                {options.map((option) => (
                  <div>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                    {(formik.values.ttttype === option.value) && (
                      <TextField
                        type="text"
                        value={formik.values.collectionAddress}
                        onChange={formik.handleChange}
                        name="collectionAddress"
                        label="collectionAddress"
                        variant="outlined"
                        sx={{ my: 2, mx: 2 }}
                      />
                    )}
                    {(formik.values.ttttype === option.value && formik.values.poolType !== 'buy') ? (
                      <Button
                        variant="contained"
                        sx={{ my: 3 }}
                        onClick={async () => {
                          const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
                          await setApproval({
                            nftContractAddress: formik.values.collectionAddress,
                            chainId: chainIdHex,
                            createOrSwap: 'create',
                          });
                        }}
                      >
                        Approve NFT
                      </Button>
                    ) : null}
                    {(formik.values.ttttype === option.value && formik.values.poolType !== 'sell') && (formik.values.ttttype === 'ERC721-ERC20' || formik.values.ttttype === 'ERC1155-ERC20') ? (
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
                        <Button
                          variant="contained"
                          sx={{ my: 3 }}
                          onClick={async () => {
                            const amount = constants.MaxUint256;
                            const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
                            await approveToken({
                              tokenAddress: formik.values.tokenAddress,
                              amount,
                              chainId: chainIdHex,
                            });
                          }}
                        >
                          Approve ERC20
                        </Button>
                      </>
                    ) : null}
                  </div>
                ))}
              </RadioGroup>
            </Stack>

            <Divider />
            {/* // 3 slect ttttype and approve collection and token */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '2xl' }}>3 set up relative data</Typography>
            <Stack flexDirection="row" sx={{ my: 4, mx: 2 }}>
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
              <TextField
                type="number"
                disabled
                value={formik.values.protocolFee}
                name="protocolFee"
                label="protocolFee"
                variant="outlined"
                sx={{ my: 2, mx: 2, ml: 6 }}
              />
              <TextField
                type="number"
                value={formik.values.projectFee}
                disabled
                name="projectFee"
                label="projectFee"
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
              {formik.values.poolType !== 'buy' && (formik.values.ttttype === 'ERC721-NativeToken' || formik.values.ttttype === 'ERC721-ERC20') ? (
                <TextField
                  type="text"
                  value={formik.values.nftIds}
                  onChange={(e) => {
                    const inputString = e?.target?.value;
                    const validInput = /^[\d,]*$/.test(inputString);
                    if (validInput) {
                      const newTokenIds = inputString.split(',').map((id) => (id.trim()));
                      formik.setFieldValue('nftIds', newTokenIds);
                      console.log('xxxxxxxx:', newTokenIds);
                    }
                  }}
                  name="nftIds"
                  label="nftIds"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}
              {formik.values.ttttype === 'ERC1155-NativeToken' || formik.values.ttttype === 'ERC1155-ERC20' ? (
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
            </Stack>
            <Stack flexDirection="row">
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

              {formik.values.poolType === 'trade' ? (
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

              {formik.values.poolType !== 'sell' && (formik.values.ttttype === 'ERC721-ERC20' || formik.values.ttttype === 'ERC1155-ERC20') ? (
                <TextField
                  type="text"
                  value={formik.values.initialTokenBalance}
                  onChange={formik.handleChange}
                  name="initialTokenBalance"
                  label="initialTokenBalance"
                  variant="outlined"
                  sx={{ my: 2, mx: 2 }}
                />
              ) : null}

            </Stack>

            <Divider />
            {/* // 4 Create Pool */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '2xl' }}>4 Create Pool</Typography>
            <Stack flexDirection="row" sx={{ my: 4, mx: 2 }}>
              {formik?.values?.ttttype === 'ERC721-NativeToken' || formik?.values?.ttttype === 'ERC1155-NativeToken' ? (
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
            </Stack>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
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
              formik?.values?.collectionAddress
            }
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>
            Price data:
          </Typography>
          <ReactJson src={priceJson} theme="monokai" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CreatePool;
