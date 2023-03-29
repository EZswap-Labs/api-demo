import {
  Box, Stack, Typography,
} from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Stack flexDirection="row" justifyContent="space-between">
      <Stack
        flexDirection="row"
        rowGap={2}
        columnGap={2}
        my={2}
        mx={4}
        sx={{
          a: {
            display: 'inline-block',
            textDecoration: 'none',
            border: '1px dashed #000',
            p: 2,
          },
        }}
      >
        <a href="https://ezswap.io/" target="_blank" rel="noreferrer">EZ-Swap</a>
        <Link to="/mathlib">MathLib</Link>
        <Link to="/sell">Sell NFT to pool</Link>
        <Link to="/buy">Buy NFT from pool</Link>
        <Link to="/createPool">Create Pool</Link>
        <a href="https://github.com/EZswap-Labs/api-demo" target="_blank" rel="noreferrer">Github</a>
        <a href="https://ezswap.readme.io/" target="_blank" rel="noreferrer">Api</a>
      </Stack>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mr: 2,
          my: 2,
        }}
      >
        <ConnectButton />
      </Box>
    </Stack>
  );
}

export default Header;
