import { ethers, utils } from 'ethers';
import mathLib from 'ezswap_math';
import { toast } from 'react-toastify';
import EZswap from '../ABI/EZswap.json';

// 调用的路由合约
const routerAddress = '0x183Eb45a05EA5456A6D329bb76eA6C6DABb375a6';

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
  address, selectedList,
}) => {
  // init provider
  const buyAbi = ['function robustSwapETHForSpecificNFTs(tuple(tuple(address,uint256[],uint256[]),uint256)[],address,address,uint256) public payable returns (uint256)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(routerAddress, buyAbi, signer);
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
    const nftPrice = mathLib[item.bondingCurve]?.[item.type](
      Number(utils.formatEther(item.spotPrice)),
      Number(utils.formatEther(item.delta)),
      Number(utils.formatEther(item.fee)),
      Number(utils.formatEther(item.protocolFee)),
      projectFee,
      buyCount,
    );
    // const formatMoney = formatCeilNumber();
    // 计算的结果单位是E,需要转成wei传给合约
    // 1.005是默认滑点,
    // 原因: 买NFT有保险机制,超过total就取消购买,防止夹子.
    // 计算库精度较高,计算参数可能因为四舍五入导致误差,所以设置默认滑点消除误差
    const total = utils.parseEther((nftPrice.priceData.userBuyPrice * 1.005).toString());
    totalValue += Number(total);
    // todo 想要购买的NFT,1155一个池子只允许有一个tokenId,所以直接取字段,
    //  721因为一个池子可能有多个tokenId,需要根据用户的选择设置值,demo默认选择了第一个
    const chooseTokenId = [item.is1155 ? Number(item.nftId1155) : Number(item.nftIds.split(',')[0])];
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
};

/**
 * 支持一次性将NFT卖给多个池子,能够实现购物车功能
 * @param address 未用完的金额回退地址
 * @param selectedList list中是选中的池子
 * @returns {Promise<void>}
 */
export const sellMultipleNFT = async ({
  address, selectedList,
}) => {
  // init provider
  const buyTicketAbi = ['function robustSwapNFTsForToken(tuple(tuple(address,uint256[],uint256[]),uint256)[],address,uint256) public returns (uint256)'];
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  const ticketContract = new ethers.Contract(routerAddress, buyTicketAbi, signer);
  // init provider
  let totalValue = 0;
  const NFTData = [];
  // todo 721:选择nft的数量, 1155: 该nft tokenId想要卖的数量
  const sellCount = 1;
  // 循环选中的每个池子,整理成合约需要的参数.
  selectedList.forEach((item) => {
    // todo 项目方协议费,自定义设置 例:0.5%计算时换算成0.005
    const projectFee = 0.005;
    // 计算购买NFT需要的金额
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
    const total = utils.parseEther((priceItem.priceData.userSellPrice * 0.995).toString());
    totalValue += Number(total);
    // todo 想要出售的NFT,1155一个池子只允许有一个tokenId,所以直接取字段,
    //  721因为一个池子可能有多个tokenId,需要根据用户的选择设置值,demo默认选择了第一个
    const chooseTokenId = [item.is1155 ? Number(item.nftId1155) : Number(item.nftIds.split(',')[0])];
    // 构造合约参数需要的数据结构
    NFTData.push([[item.id, chooseTokenId, [sellCount]], total]);
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

const LSSVMPairFactory = {
  '0x5': '0xDe0293798084CC26D8f11784C9F09F7a967BEce5',
  '0x89': '0x7452c6e193298a2df001ea38b6369fbdc0a38123',
};

// 创建池子
export const createPair = async ({ tokenType = 'ERC721', params }) => {
  try {
    const ABI = tokenType === 'ERC721' ? createPairABI : createPairABI1155;
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    // 用G网测试 0x5
    const createPairContract = new ethers.Contract(LSSVMPairFactory?.['0x5'], ABI, signer);
    let createTx;
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
