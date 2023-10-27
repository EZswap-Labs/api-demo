import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Typography, Box, TextField, Button,
} from '@mui/material';
import mathLib from 'ezswap_math';
import {
  utils, BigNumber, getDefaultProvider, ethers, constants,
} from 'ethers';
import { toast } from 'react-toastify';
import {
  useAccount, useConnect, useDisconnect, useClient, useChainId,
} from 'wagmi';
import {
  buyMultipleNFT, buyMultipleNFTERC20, sellMultipleNFT, setApproval, approveTokenRouter,
} from '../toolkit/transaction';

const NFTcolumns = [
  { field: 'id', headerName: 'ID', width: 100 },
];
const columns = [
  { field: 'id', headerName: 'pool address', width: 200 },
  {
    field: 'token address',
    headerName: 'token address',
    width: 400,
    valueGetter: (data) => (data?.row?.token),
  },
  {
    field: 'nftIds',
    headerName: 'nftIds',
    width: 100,
    valueGetter: (data) => (data?.row?.nftIds?.toString()),
  },
  { field: 'bondingCurve', headerName: 'bondingCurve', width: 100 },
  {
    field: 'type',
    headerName: 'type',
    width: 100,
    // valueGetter: (data) => (getType(data?.row?.type)),
  },
  {
    field: 'spotPrice',
    headerName: 'spotPrice',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.spotPrice))),
  },
  {
    field: 'delta',
    headerName: 'delta',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.delta))),
  },
  {
    field: 'fee',
    headerName: 'swap fee',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.fee))),
  },
  {
    field: 'protocolFee',
    headerName: 'protocolFee',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.protocolFee))),
  },{
    field: 'vol',
    headerName: 'vol',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.ethVolume))),
  },{
    field: 'balance',
    headerName: 'balance',
    width: 100,
    valueGetter: (data) => (Number(utils.formatEther(data?.row?.ethBalance))),
  },
  // { field: 'gfee', headerName: 'gfee', width: 100 },
];
const calculatedColumns = [
  { field: 'id', headerName: 'ID', width: 100 },
  {
    field: 'nftIds',
    headerName: 'nftIds',
    width: 100,
    valueGetter: (data) => (data?.row?.nftIds?.toString()),
  },
  { field: 'bondingCurve', headerName: 'bondingCurve', width: 100 },
  { field: 'type', headerName: 'type', width: 100 },
  { field: 'currentPrice', headerName: 'currentPrice', width: 200 },
  { field: 'nextPrice', headerName: 'nextPrice', width: 200 },
];

export default function NftTable({
  poolList = [], actionType = 'Buy', nftContractAddress,
}) {
  const { address, isConnected } = useAccount();
  // const client = useClient();
  const chainId = useChainId();

  // const [calculatedlist, setCalculatedlist] = React.useState([]);
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const [tokenId, setTokenId] = React.useState([]);

  /* React.useEffect(() => {
    const tempList = poolList
      // ?.filter((p) => (p.id === '0x4cddd875f3cbef84ce7a0547fea35d96d37d17ea'))
      ?.map((pool) => {
        const {
          spotPrice, delta, protocolFee, fee, gfee, type, bondingCurve, nftIds,
        } = pool;
        const action = type;
        // todo 项目方协议费,自定义设置 例:0.5%计算时换算成0.005
        const projectFee = 0.005;
        const priceItem = mathLib?.[bondingCurve]?.[action](
          Number(utils.formatEther(spotPrice)),
          Number(utils.formatEther(delta)),
          Number(utils.formatEther(fee)),
          Number(utils.formatEther(protocolFee)),
          projectFee,
          index,
        );
        const temp = {
          ...pool,
          id: pool.id,
          type,
          tokenId: nftIds?.[0],
          nftIds,
          bondingCurve,
          currentPrice: priceItem?.currentPrice?.userBuyPrice,
          nextPrice: priceItem?.nextPrice?.userBuyPrice,
        };
        return temp;
      });
    setCalculatedlist(tempList);
  }, [poolList, index]); */

  const approve = () => {
    const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
    setApproval({
      nftContractAddress,
      chainId: chainIdHex,
      createOrSwap: 'swap',
    });
  };

  const buyNFT = (ActionType) => {
    if (!address) {
      toast.warn('Please connect the wallet!');
    }
    if (!isConnected) {
      toast.warn('Please connect the wallet!');
    }
    const selectedList = selectedKeys?.map((key) => poolList.find((c) => c.id === key));
    const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
    if (ActionType === 'Buy') {
      // 从池子里购买NFT,
      if (selectedList[0].token === '0x0000000000000000000000000000000000000000') {
        buyMultipleNFT({
          address,
          selectedList,
          chainId: chainIdHex,
        });
      } else {
        buyMultipleNFTERC20({
          address,
          selectedList,
          chainId: chainIdHex,
        });
      }
    } else {
      // 将自己的NFT卖给池子
      // address:nft出售方
      console.log('xxxxxxxx');
      sellMultipleNFT({
        address,
        selectedList,
        chainId: chainIdHex,
        tokenId,
      });
    }
  };

  return (
    <Box sx={{ height: 200, width: '100%' }}>

      {/* {actionType === 'Sell'
        ? (
          <Box>
            <Typography variant="h5" sx={{ my: 2 }}>My NFT List</Typography>
            <DataGrid
              rows={poolList}
              columns={NFTcolumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              checkboxSelection
            />
          </Box>
        ) : null} */}

      <Typography variant="h5" sx={{ my: 2 }}>Original Pool Data</Typography>
      <DataGrid
        sx={{
          minHeight: '400px',
        }}
        rows={poolList}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        onRowSelectionModelChange={(keys) => {
          console.log('keysorigin', keys);
          setSelectedKeys(keys);
        }}
      />
      {/* <Typography variant="h5" sx={{ my: 2 }}>
        Calculated data
        <TextField
          type="number"
          label="index"
          variant="outlined"
          value={index}
          sx={{ ml: 2 }}
          onChange={(e) => {
            console.log('Number(e?.target?.value)', Number(e?.target?.value));
            setIndex(Number(e?.target?.value));
          }}
        />
      </Typography>

       <DataGrid
        rows={calculatedlist}
        columns={calculatedColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        onRowSelectionModelChange={(keys) => {
          console.log('keys', keys);
          setSelectedKeys(keys);
        }}
      /> */}
      {actionType !== 'Buy' ? (
        <Box>
          <TextField
            label="tokenId"
            variant="outlined"
            value={tokenId.join(',')}
            sx={{ mt: 2, mr: 2, width: '200px' }}
            onChange={(e) => {
              const inputString = e?.target?.value;
              const validInput = /^[\d,]*$/.test(inputString);

              if (validInput) {
                const newTokenIds = inputString.split(',').map((id) => (id.trim()));
                setTokenId(newTokenIds);
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              approve();
            }}
            sx={{ m: 2 }}
          >
            Approve NFT TO ROUTER
          </Button>
        </Box>
      ) : null}
      <Button
        variant="contained"
        onClick={() => {
          buyNFT(actionType);
        }}
        sx={{ my: 2 }}
      >
        {actionType}
      </Button>
      {actionType === 'Buy' ? (
        <Button
          variant="contained"
          onClick={async () => {
            const amount = constants.MaxUint256;
            const chainIdHex = ethers.BigNumber.from(chainId).toHexString();
            const selectedList = selectedKeys?.map((key) => poolList.find((c) => c.id === key));
            await approveTokenRouter({
              tokenAddress: selectedList[0].token,
              amount,
              chainId: chainIdHex,
            });
          }}
          sx={{ m: 2 }}
        >
          Approve ERC20 TO ROUTER
        </Button>
      ) : null}
    </Box>
  );
}
