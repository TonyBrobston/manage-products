'use client'
import {useState} from 'react';
import {Builder, parseString} from 'xml2js';
import {Box, Button, Container, CssBaseline, FormControl, TextField} from '@mui/material';

function UploadFileIcon() {
  return null;
}

export default function Home() {
  const [filename, setFilename] = useState('');
  const [json, setJson] = useState({});
  const [productNameContains, setProductNameContains] = useState('');
  const [matchingProduct, setMatchingProduct] = useState(null);
  const [modifiedXmlUrl, setModifiedXmlUrl] = useState(null);
  return (
    <>
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
            variant="outlined"
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
            variant="contained"
            onClick={() => {
              const matchingProducts = json.products.product.filter(({Name}) => Name[0].includes(productNameContains));
              const matchingProduct = JSON.parse([...new Set(matchingProducts.map(({Product_ID, Product_URL, Page_Title, Name, ...rest}) => JSON.stringify(rest)))][0]);
              setMatchingProduct(matchingProduct);
            }}
          >
            Submit
          </Button>
        </FormControl>
        {
          matchingProduct && <form onSubmit={(event) => {
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
                    product.Name[0].includes(productNameContains) ?
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
            <h1>Products whose names contain: {productNameContains}</h1>
            Description:
            <textarea name="Description" type="text" defaultValue={matchingProduct.Description} style={{width: '500px'}} />
            <br />
            Price:
            <input name="Calculated_Price" type="text" defaultValue={matchingProduct.Calculated_Price} />
            <br />
            Shipping Price:
            <input name="Fixed_Shipping_Price" type="text" defaultValue={matchingProduct.Fixed_Shipping_Price} />
            <br />
            Weight:
            <input name="Weight" type="text" defaultValue={matchingProduct.Weight} />
            <br />
            <input type="submit" value="Submit" />
          </form>
        }
        {modifiedXmlUrl && <a href={modifiedXmlUrl} download={`${filename}-modified`}><button>Download Modified XML</button></a>}
      </Container>
    </>
  )
}
