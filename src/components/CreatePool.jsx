import {
  Button, Box, FormControl, InputLabel, Input, FormHelperText, Stack,
} from '@mui/material';

function CreatePool() {
  return (
    <Box>
      <Stack
        sx={{
          width: 400,
        }}
      >
        <FormControl>
          <InputLabel htmlFor="my-input">contract address</InputLabel>
          <Input id="my-input" aria-describedby="my-helper-text" />
        </FormControl>
      </Stack>
      <Stack>
        <Button
          sx={{
            width: 200,
          }}
          variant="contained"
          onClick={() => {
            console.log(1);
          }}
        >
          Create Pool

        </Button>
      </Stack>
    </Box>
  );
}

export default CreatePool;
