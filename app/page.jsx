'use client'
import {useState} from 'react';
import {Builder, parseString} from 'xml2js';
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const caseInsensitiveIncludes = (needle, haystack) => haystack.toLowerCase().includes(needle.toLowerCase());

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const findAndSetMatchingProduct = (json, productNameContains, setMatchingProduct) => {
  const matchingProducts = json.products.product.filter(({Name}) => caseInsensitiveIncludes(productNameContains, Name[0]));
  const matchingProduct = JSON.parse([...new Set(matchingProducts.map(({
    Product_ID,
    Product_URL,
    Page_Title,
    Name,
    ...rest
  }) => JSON.stringify(rest)))][0]);
  setMatchingProduct(matchingProduct);
}

export default function Home() {
  const [filename, setFilename] = useState('');
  const [json, setJson] = useState({});
  const [productNameContains, setProductNameContains] = useState('');
  const [matchingProduct, setMatchingProduct] = useState(null);
  const [modifiedXmlUrl, setModifiedXmlUrl] = useState(null);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container
        sx={{display: "flex"}}
      >
        <FormControl
          style={{
            width: "400px",
            margin: "0 auto"
          }}
        >
          <Button
            component="label"
            variant="text"
            startIcon={<UploadFileIcon />}
            sx={{ margin: "10px", float: "left" }}
          >
            Upload XML
            <input type="file" accept=".xml" hidden onChange={({target: {files}}) => {
              if (!files) {
                return;
              }
              const file = files[0];
              const { name } = file;
              setFilename(name.split('.xml')[0]);
              const reader = new FileReader();
              reader.onload = (event) => {
                if (!event?.target?.result) {
                  return;
                }
                const { result } = event.target;
                parseString(result, function (error, fileJson) {
                  setJson(fileJson);
                });
              };
              reader.readAsText(file)
            }} />
          </Button>
          <TextField
            label="Shared Product Name Text"
            value={productNameContains}
            onChange={({target: {value}}) => {setProductNameContains(value)}}
            onKeyDown={({key}) => {
              if(key === "Enter"){
                findAndSetMatchingProduct(json, productNameContains, setMatchingProduct);
              }
            }}
            sx={{ margin: "10px" }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              findAndSetMatchingProduct(json, productNameContains, setMatchingProduct);
            }}
          >
            Submit
          </Button>
          {
            matchingProduct &&
              <Box component="form" onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.target);
                const formProps = Object.fromEntries(formData);
                const formPropsAsArrays = Object.entries(formProps).reduce((accumulator, [key, value]) => ({...accumulator, [key]: [value]}), {});
                const modifiedJson = {
                  ...json,
                  products: {
                    ...json.products,
                    product: [
                      ...json.products.product.map((product) => (
                        caseInsensitiveIncludes(productNameContains, product.Name[0]) ?
                          {
                            ...product,
                            ...formPropsAsArrays,
                          }
                          : product
                      )),
                    ],
                  },
                };
                const xml = new Builder().buildObject(modifiedJson);
                const modifiedXmlBlob = new Blob([xml], {type: 'text/xml'});
                const url = window.URL.createObjectURL(modifiedXmlBlob);
                setModifiedXmlUrl(url);
              }}>
                <TextField
                  name="Description"
                  label="Description"
                  defaultValue={matchingProduct.Description}
                  sx={{ margin: "10px", width: "382px" }}
                />
                <TextField
                  name="Calculated_Price"
                  label="Price"
                  defaultValue={matchingProduct.Calculated_Price}
                  sx={{ margin: "10px", width: "382px" }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                <TextField
                  name="Fixed_Shipping_Price"
                  label="Shipping Price"
                  defaultValue={matchingProduct.Fixed_Shipping_Price}
                  sx={{ margin: "10px", width: "382px" }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                <TextField
                  name="Weight"
                  label="Weight"
                  defaultValue={matchingProduct.Weight}
                  sx={{ margin: "10px", width: "382px" }}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">g</InputAdornment>,
                  }}
                />
                <Button
                  variant="outlined"
                  type="submit"
                  sx={{ width: "400px" }}
                >
                  Submit
                </Button>
              </Box>
          }
          {
            modifiedXmlUrl &&
              <a href={modifiedXmlUrl} download={`${filename}-modified`}>
                <Button
                  variant="contained"
                  sx={{ marginTop: "10px", width: "400px" }}
                >
                  Download Modified XML
                </Button>
              </a>
          }
        </FormControl>
      </Container>
    </ThemeProvider>
  )
}
