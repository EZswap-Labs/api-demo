import { ethers, utils } from 'ethers';
import mathLib from 'ezswap_math';
import { toast } from 'react-toastify';
import ZKFactory from '../ABI/ZK/Factory.json';

// 调用的路由合约
const routerAddress = {
  '0x05': '0xE6e9a0E4faA67F647F0cbAf633B2e624F141498a',
  '0x89': '0x3d51749Cb2Db7355392100BAc202216BE7071E66',
  '0x0118': '0xC72564dCEe45a8DEf91dA25F875719c2f1Fa8fad',
  '0x013881': '0x3d51749Cb2Db7355392100BAc202216BE7071E66',
  '0xa4b1': '0x2A95E4FDF5F12B9E9AC627fEcbF70420D3202db1',
  '0x066eed': '0x11AA93F7f1ffE58eb42ae0A5d79f7f75321AcB45',
  '0x2d5311': '0xF7Dbd98fF399CEeD40D58e20A8cC876752DDD7d2',
  '0x34816d': '0x28Fd27256d1E1CEaeB38a33A8C8945E4421f9EC3',
  '0xa9': '0x3d51749Cb2Db7355392100BAc202216BE7071E66',
};

const LSSVMPairFactory = {
  '0x05': '0x5a1CA387586BC305ac3592b7d030d4A18aBD7d8a',
  '0x0118': '0xBcB7032c1e1Ea0Abc3850590349560e1333d6848',
  '0x89': '0x353F4106641Db62384cF0e4F1Ef15F8Ac9A9fb4B',
  '0x013881': '0x353F4106641Db62384cF0e4F1Ef15F8Ac9A9fb4B',
  '0xa4b1': '0x3d51749Cb2Db7355392100BAc202216BE7071E66',
  '0x066eed': '0x9D79c95314eB049e1FAFEAf14bc7B221Baf95F81',
  '0x2d5311': '0x6D4dD244BEFAfE26274f206E8eee5a7dbe72bFfE',
  '0x34816d': '0x86388a46f5e3dafbf815b7521e244930E0727eE3',
  '0xa9': '0x353F4106641Db62384cF0e4F1Ef15F8Ac9A9fb4B',
};

export const setApproval = async ({ nftContractAddress, chainId, createOrSwap }) => {
  const approvedForAllAbi = [
    'function setApprovalForAll(address,bool) public',
  ];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const nftContract = new ethers.Contract(nftContractAddress, approvedForAllAbi, signer);
  const transition = await nftContract.setApprovalForAll(createOrSwap === 'swap' ? routerAddress?.[chainId] : LSSVMPairFactory?.[chainId], true);
  const res = await transition.wait();
  console.log('res', res);
  toast.success('success');
};

export const isApproval = async ({ nftContractAddress, userAddress, chainId }) => {
  console.log('nftContractAddress, userAddress, chainId', nftContractAddress, userAddress, chainId);
  const approvedForAllAbi = ['function isApprovedForAll(address owner, address operator) public view returns (bool)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const nftContract = new ethers.Contract(nftContractAddress, approvedForAllAbi, signer);
  console.log('nftContract', nftContract);
  const isApproved = await nftContract.isApprovedForAll(userAddress, LSSVMPairFactory?.[chainId]);
  console.log('isApproved', isApproved);
  return isApproved;
};

export const approveToken = async ({ tokenAddress, amount, chainId }) => {
  const approvedAbi = ['function approve(address _spender, uint256 _value) public returns (bool)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(tokenAddress, approvedAbi, signer);
  const isApproved = await tokenContract.approve(LSSVMPairFactory?.[chainId], amount);
  const res = await isApproved.wait();
  console.log('isApproved', isApproved);
  toast.success('success');
  return isApproved;
};

export const approveTokenRouter = async ({ tokenAddress, amount, chainId }) => {
  const approvedAbi = ['function approve(address _spender, uint256 _value) public returns (bool)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(tokenAddress, approvedAbi, signer);
  const isApproved = await tokenContract.approve(routerAddress?.[chainId], amount);
  const res = await isApproved.wait();
  console.log('isApproved', isApproved);
  toast.success('success');
  return isApproved;
};

export const allowanceToken = async ({ tokenAddress, userAddress, chainId }) => {
  const approvedAbi = ['function allowance(address _owner, address _spender) public view returns (uint256)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(tokenAddress, approvedAbi, signer);
  const amount = await tokenContract.allowance(userAddress, LSSVMPairFactory?.[chainId]);
  return Number(utils.formatEther(amount));
};

// const formatCeilNumber = (value) => (Math.ceil(value * 10000) / 10000);

/* export const buySingleNFT = async ({
  poolAddress, address, total, tokenId,
}) => {
  const DEADLINE = Date.parse(new Date()) / 1000 + 60 * 3600;
  const buyTicketAbi = ['function robustSwapETHForSpecificNFTs(tuple(tuple(address,uint256[],
  uint256[]),uint256)[],address,address,uint256) public payable returns (uint256)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const ticketContract = new ethers.Contract(routerAddress, buyTicketAbi, signer);
  const totalValue = utils.parseEther(formatCeilNumber(total)?.toString()).toString();
  const buyTx = await ticketContract.robustSwapETHForSpecificNFTs(
    [[[poolAddress, [tokenId]], totalValue]],
    address,
    address,
    DEADLINE,
    { value: totalValue },
  );
  const receipt = await buyTx.wait();
  console.log('receipt', receipt);
}; */
/**
 * 支持一次性从多个池子中购买NFT,能够实现购物车功能
 * @param address nft接收方和未用完金额回退地址,可以分开设置
 * @param selectedList list中是选中的池子
 * @returns {Promise<void>}
 */
export const buyMultipleNFT = async ({
  address, selectedList, chainId,
}) => {
  try {
    // init provider
    const buyAbi = ['function robustSwapETHForSpecificNFTs(tuple(tuple(address,uint256[],uint256[]),uint256)[],address,address,uint256) public payable returns (uint256)'];
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(routerAddress?.[chainId], buyAbi, signer);
    // init provider
    const NFTData = [];
    // todo 721:选择nft的数量, 1155: 该nft tokenId想要买的数量
    const buyCount = 1;
    let totalValue = 0;
    // 循环选中的每个池子,整理成合约需要的参数.totalValue:购买所有NFT的总价
    selectedList.forEach((item) => {
      // todo 项目方协议费,自定义设置 例:0.5%计算时换算成0.005
      const projectFee = 0.005;
      // 计算购买NFT需要的金额
      // let { delta } = item;
      // if (item.type === 'trade') {
      //   delta += 1;
      // }
      const nftPrice = mathLib[item.bondingCurve]?.[item.type](
        Number(utils.formatEther(item.spotPrice)),
        Number(utils.formatEther(item.delta)),
        Number(utils.formatEther(item.fee)),
        Number(utils.formatEther(item.protocolFee)),
        projectFee,
        buyCount,
        'read',
      );
      // const formatMoney = formatCeilNumber();
      // 计算的结果单位是E,需要转成wei传给合约
      // 1.005是默认滑点,
      // 原因: 买NFT有保险机制,超过total就取消购买,防止夹子.
      // 计算库精度较高,计算参数可能因为四舍五入导致误差,所以设置默认滑点消除误差
      const total = utils.parseEther((nftPrice.priceData.userBuyPrice * 1.005)
        .toFixed(5)
        .toString());
      totalValue += Number(total);
      // todo 想要购买的NFT,1155一个池子只允许有一个tokenId,所以直接取字段,
      //  721因为一个池子可能有多个tokenId,需要根据用户的选择设置值,demo默认选择了第一个
      const chooseTokenId = [item.is1155 ? Number(item.nftId1155) : Number(item.nftIds?.[0])];
      // 构造合约参数需要的数据结构
      NFTData.push([[item.id, chooseTokenId, [buyCount]], total]);
    });
    // 上链
    const buyTx = await contract.robustSwapETHForSpecificNFTs(
      NFTData,
      // 未用完的金额回退地址
      address,
      // nft接收地址
      address,
      // 超过这个时间,则取消购买
      Date.parse(new Date()) / 1000 + 60 * 3600,
      // 支付的总金额
      { value: totalValue.toString() },
    );
    // 等待上链成功
    const receipt = await buyTx.wait();
    console.log('receipt', receipt);
  } catch (error) {
    console.log('buyMultipleNFT', error);
  }
};

export const buyMultipleNFTERC20 = async ({
  address, selectedList, chainId,
}) => {
  try {
    // init provider
    const buyAbi = ['function robustSwapERC20ForSpecificNFTs(tuple(tuple(address,uint256[],uint256[]),uint256)[],uint256,address,uint256) public returns (uint256)'];
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(routerAddress?.[chainId], buyAbi, signer);
    // init provider
    const NFTData = [];
    // todo 721:选择nft的数量, 1155: 该nft tokenId想要买的数量
    const buyCount = 1;
    let totalValue = 0;
    // 循环选中的每个池子,整理成合约需要的参数.totalValue:购买所有NFT的总价
    selectedList.forEach((item) => {
      // todo 项目方协议费,自定义设置 例:0.5%计算时换算成0.005
      const projectFee = 0.005;
      // 计算购买NFT需要的金额
      // let { delta } = item;
      // if (item.type === 'trade') {
      //   delta += 1;
      // }
      const nftPrice = mathLib[item.bondingCurve]?.[item.type](
        Number(utils.formatEther(item.spotPrice)),
        Number(utils.formatEther(item.delta)),
        Number(utils.formatEther(item.fee)),
        Number(utils.formatEther(item.protocolFee)),
        projectFee,
        buyCount,
        'read',
      );
      // const formatMoney = formatCeilNumber();
      // 计算的结果单位是E,需要转成wei传给合约
      // 1.005是默认滑点,
      // 原因: 买NFT有保险机制,超过total就取消购买,防止夹子.
      // 计算库精度较高,计算参数可能因为四舍五入导致误差,所以设置默认滑点消除误差
      const total = utils.parseEther((nftPrice.priceData.userBuyPrice * 1.005)
        .toFixed(5)
        .toString());
      totalValue += Number(total);
      // todo 想要购买的NFT,1155一个池子只允许有一个tokenId,所以直接取字段,
      //  721因为一个池子可能有多个tokenId,需要根据用户的选择设置值,demo默认选择了第一个
      const chooseTokenId = [item.is1155 ? Number(item.nftId1155) : Number(item.nftIds?.[0])];
      // 构造合约参数需要的数据结构
      NFTData.push([[item.id, chooseTokenId, [buyCount]], total]);
    });
    // 上链
    console.log(NFTData);
    const buyTx = await contract.robustSwapERC20ForSpecificNFTs(
      NFTData,
      // 支付的总金额
      ethers.BigNumber.from(totalValue.toString()),
      // nft接收地址
      address,
      // 超过这个时间,则取消购买
      Date.parse(new Date()) / 1000 + 60 * 3600,
    );
    // 等待上链成功
    const receipt = await buyTx.wait();
    console.log('receipt', receipt);
  } catch (error) {
    console.log('buyMultipleNFT', error);
  }
};

/**
 * 支持一次性将NFT卖给多个池子,能够实现购物车功能
 * @param address 未用完的金额回退地址
 * @param selectedList list中是选中的池子
 * @returns {Promise<void>}
 */
export const sellMultipleNFT = async ({
  address, selectedList, chainId, tokenId,
}) => {
  // init provider
  const buyTicketAbi = ['function robustSwapNFTsForToken(tuple(tuple(address,uint256[],uint256[]),uint256)[],address,uint256) public returns (uint256)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const ticketContract = new ethers.Contract(routerAddress?.[chainId], buyTicketAbi, signer);
  // init provider
  let totalValue = 0;
  const NFTData = [];
  // todo 721:选择nft的数量, 1155: 该nft token Id想要卖的数量
  const sellCount = 1;
  // 循环选中的每个池子,整理成合约需要的参数.
  selectedList.forEach((item) => {
    // todo 项目方协议费,自定义设置 例:0.5%计算时换算成0.005
    const projectFee = 0.005;
    // 计算购买NFT需要的金额
    // let { delta } = item;
    // if (item.type === 'trade') {
    //   delta += 1;
    // }
    const priceItem = mathLib[item.bondingCurve]?.[item.type](
      Number(utils.formatEther(item.spotPrice)),
      Number(utils.formatEther(item.delta)),
      Number(utils.formatEther(item.fee)),
      Number(utils.formatEther(item.protocolFee)),
      projectFee,
      sellCount,
    );
    // const formatMoney = formatCeilNumber();
    // 计算的结果单位是E,需要转成wei传给合约
    // 0.995是默认滑点,
    // 原因: 出售NFT有保险机制,低于total就取消出售,防止夹子.
    // 计算库精度较高,计算参数可能因为四舍五入导致误差,所以设置默认滑点消除误差
    const total = utils.parseEther((priceItem.priceData.userSellPrice * 0.995)
      .toFixed(5)
      .toString());
    totalValue += Number(total);
    // todo 想要出售的NFT,1155一个池子只允许有一个tokenId,所以直接取字段,
    //  721因为一个池子可能有多个tokenId,需要根据用户的选择设置值,demo默认选择了第一个
    // 构造合约参数需要的数据结构
    NFTData.push([[item.id, tokenId, [sellCount]], total]);
    // const chooseTokenId = [item.is1155 ? Number(item.nftId1155) :
    //  Number(item?.nftIds?.split(',')[0])];
    // NFTData.push([[item.id, chooseTokenId, [sellCount]], total]);
  });
  // 上链
  const approveTx = await ticketContract.robustSwapNFTsForToken(
    NFTData,
    // 未用完的金额回退地址
    address,
    // 超过这个时间,则取消出售
    Date.parse(new Date()) / 1000 + 60 * 3600,
  );
  // 等待上链成功
  const receipt = await approveTx.wait();
  console.log('receipt', receipt);
};

export const createPairABI = ['function createPairETH(address,address,address,uint8,uint128,uint96,uint128,uint256[]) external payable returns(address)'];

export const createPairABI1155 = ['function createPair1155ETH(address,address,address,uint8,uint128,uint96,uint128,uint256,uint256) external payable returns(address)'];

export const createZKPair = async ({ tokenType = 'ERC721', params, chainId }) => {
  console.log('tokenType', tokenType);
  try {
    const ABI = ZKFactory.abi;
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    const createPairContract = new ethers.Contract(LSSVMPairFactory?.[chainId], ABI, signer);
    let createParams = null;
    let createTx = null;
    if (tokenType === 'ERC721') {
      createParams = [
        {
          nft: params?.[0],
          bondingCurve: params?.[1],
          assetRecipient: params?.[2],
          poolType: params?.[3],
          delta: params?.[4],
          fee: params?.[5],
          spotPrice: params?.[6],
          initialNFTIDs: params?.[7],
        },
        {
          value: params?.[8]?.value,
        },
      ];
      createTx = await createPairContract.createPairETH(...createParams);
    } else if (tokenType === 'ERC1155') {
      createParams = [
        {
          nft: params?.[0],
          bondingCurve: params?.[1],
          assetRecipient: params?.[2],
          poolType: params?.[3],
          delta: params?.[4],
          fee: params?.[5],
          spotPrice: params?.[6],
          nftId: params?.[7],
          initialNFTCount: params?.[8],
        },
        {
          value: params?.[9]?.value || '0x00',
        },
      ];
      createTx = await createPairContract.createPair1155ETH(...createParams);
    } else {
      createTx = await createPairContract.createPairERC20([...params]);
    }
    const receipt = await createTx.wait();
    console.log('receipt', receipt);
  } catch (error) {
    toast.error(error?.message);
    console.log('error: ', error);
    // console.log('error: ', error.error);
  }
};

export const createV2Pair = async ({ ttttype, params, chainId }) => {
  try {
    const ABI = ZKFactory.abi;
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    console.log(params);
    console.log(chainId, LSSVMPairFactory['0x066eed']);
    const createPairContract = new ethers.Contract(LSSVMPairFactory?.[chainId], ABI, signer);
    console.log(createPairContract.address);
    let createParams = null;
    let createTx = null;

    if (ttttype === 'ERC721-NativeToken') {
      createParams = [
        {
          nft: params?.[0],
          bondingCurve: params?.[1],
          assetRecipient: params?.[2],
          poolType: params?.[3],
          delta: params?.[4],
          fee: params?.[5],
          spotPrice: params?.[6],
          initialNFTIDs: params?.[7],
        },
        {
          value: params?.[8]?.value,
        },
      ];
      createTx = await createPairContract.createPairETH(...createParams);
    } else if (ttttype === 'ERC1155-NativeToken') {
      createParams = [
        {
          nft: params?.[0],
          bondingCurve: params?.[1],
          assetRecipient: params?.[2],
          poolType: params?.[3],
          delta: params?.[4],
          fee: params?.[5],
          spotPrice: params?.[6],
          nftId: params?.[7],
          initialNFTCount: params?.[8],
        },
        {
          value: params?.[9]?.value || '0x00',
        },
      ];
      createTx = await createPairContract.createPair1155ETH(...createParams);
    } else if (ttttype === 'ERC721-ERC20') {
      createTx = await createPairContract.createPairERC20([...params]);
    } else if (ttttype === 'ERC1155-ERC20') {
      createTx = await createPairContract.createPair1155ERC20([...params]);
    }
    const receipt = await createTx.wait();
    console.log('receipt', receipt);
  } catch (error) {
    toast.error(error?.message);
    console.log('error: ', error);
  }
};

// 创建池子
export const createPair = async ({ tokenType = 'ERC721', params, chainId }) => {
  if (chainId) {
    createZKPair({ tokenType, params, chainId });
    return;
  }
  try {
    const ABI = tokenType === 'ERC721' ? createPairABI : createPairABI1155;
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    const createPairContract = new ethers.Contract(LSSVMPairFactory?.[chainId], ABI, signer);
    let createTx;
    // params.push()
    if (tokenType === 'ERC721') {
      createTx = await createPairContract.createPairETH(...params);
    } else {
      createTx = await createPairContract.createPair1155ETH(...params);
    }
    const receipt = await createTx.wait();
    console.log('receipt', receipt);
  } catch (error) {
    toast.error(error?.message);
    console.log('error: ', error);
  }
};
