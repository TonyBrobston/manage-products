'use client'
import {useState} from 'react';
import {Builder, parseString} from 'xml2js';
import {Box, Button, Container, CssBaseline, FormControl, TextField} from '@mui/material';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const caseInsensitiveIncludes = (needle, haystack) => haystack.toLowerCase().includes(needle.toLowerCase());

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

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
            sx={{ margin: "10px" }}
          />
          <Button
            variant="outlined"
            onClick={() => {
              const matchingProducts = json.products.product.filter(({Name}) => caseInsensitiveIncludes(productNameContains, Name[0]));
              const matchingProduct = JSON.parse([...new Set(matchingProducts.map(({Product_ID, Product_URL, Page_Title, Name, ...rest}) => JSON.stringify(rest)))][0]);
              setMatchingProduct(matchingProduct);
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
                />
                <TextField
                  name="Fixed_Shipping_Price"
                  label="Shipping Price"
                  defaultValue={matchingProduct.Fixed_Shipping_Price}
                  sx={{ margin: "10px", width: "382px" }}
                />
                <TextField
                  name="Weight"
                  label="Weight"
                  defaultValue={matchingProduct.Weight}
                  sx={{ margin: "10px", width: "382px" }}
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
