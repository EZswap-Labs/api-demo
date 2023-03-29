import {
  FormControl, FormLabel, RadioGroup, Radio, Grid, TextField,
  FormControlLabel, Button, Box,
} from '@mui/material';
import ReactJson from 'react-json-view';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import mathLib from 'ezswap_math';
import Header from '../../components/Header';

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
  spotPrice: 1,
  delta: 0.1,
  fee: 0,
  protocolFee: 0,
  projectFee: 0,
  index: 1,
  action: 'read',
  model: 'Linear',
  poolType: 'buy',
};

const getPriceData = ({
  spotPrice, delta, fee, protocolFee, projectFee, index, model, action, poolType,
}) => {
  try {
    console.log(
      model,
      poolType,
      spotPrice,
      delta,
      fee,
      protocolFee,
      projectFee,
      index,
      action,
    );
    console.log(mathLib.Exponential.trade(0.0433, 1.056, 0.034, 0.005, 0, 3, 'read'));
    const priceData = mathLib?.[model]?.[poolType](
      spotPrice,
      delta,
      fee,
      protocolFee,
      projectFee,
      index,
      action,
    );
    console.log('priceData', priceData);
    return priceData;
  } catch (error) {
    console.log('error', error);
    return {};
  }
};

function MathLib() {
  const [priceJson, setPriceJson] = useState(myJsonObject);
  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      console.log('values', values);
      setPriceJson(getPriceData(formik?.values));
    },
  });

  useEffect(() => {
    setPriceJson(getPriceData(formik?.values));
  }, []);

  return (
    <Box sx={{ my: 2 }}>
      <Header />
      <Grid container p={4}>
        <Grid item xs={3}>
          <FormControl onSubmit={formik.handleSubmit}>
            <FormLabel sx={{ my: 2 }} id="demo-controlled-radio-buttons-group">model</FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="model"
              value={formik.values.model}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="Linear" control={<Radio />} label="Linear" />
              <FormControlLabel value="Exponential" control={<Radio />} label="Exponential" />
            </RadioGroup>
            <FormLabel sx={{ my: 2 }} id="demo-controlled-radio-buttons-group">poolType</FormLabel>
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
            <TextField
              type="number"
              value={formik.values.spotPrice}
              onChange={formik.handleChange}
              name="spotPrice"
              label="spotPrice"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <TextField
              type="number"
              value={formik.values.delta}
              onChange={formik.handleChange}
              name="delta"
              label="delta"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <TextField
              type="number"
              value={formik.values.fee}
              onChange={formik.handleChange}
              name="fee"
              label="fee"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <TextField
              type="number"
              value={formik.values.protocolFee}
              onChange={formik.handleChange}
              name="protocolFee"
              label="protocolFee"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <TextField
              type="number"
              value={formik.values.projectFee}
              onChange={formik.handleChange}
              name="projectFee"
              label="projectFee"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <TextField
              type="number"
              value={formik.values.index}
              onChange={formik.handleChange}
              name="index"
              label="index"
              variant="outlined"
              sx={{ my: 2 }}
            />
            <FormLabel sx={{ my: 2 }} id="demo-controlled-radio-buttons-group">action</FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="action"
              value={formik.values.action}
              onChange={formik.handleChange}
            >
              <FormControlLabel value="read" control={<Radio />} label="read" />
              <FormControlLabel value="create" control={<Radio />} label="create" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            startIcon={<TrendingFlatIcon />}
            sx={{ mt: 10, ml: 2 }}
            onClick={() => {
              formik.submitForm();
            }}
          >
            calculate
          </Button>
        </Grid>
        <Grid item xs={5}>
          <ReactJson src={priceJson} theme="monokai" />
        </Grid>
      </Grid>
    </Box>
  );
}

export default MathLib;
