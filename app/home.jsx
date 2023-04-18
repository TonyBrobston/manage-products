import {Grid, Paper} from '@mui/material';
import Button from '@mui/material/Button';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {Builder, parseString} from 'xml2js';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {withStyles} from '@mui/styles';
import {useState} from 'react';

const styles = (theme) => {
  console.log('theme:', theme);
  console.log('spacing type:', typeof theme.spacing);
  return (
    {
      layout: {
        width: 600,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
      paper: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3),
      },
      // buttons: {
      //   display: 'flex',
      //   justifyContent: 'flex-end',
      // },
      // button: {
      //   marginTop: theme.spacing(3),
      //   marginLeft: theme.spacing(3),
      // },
    }
  );
};

const caseInsensitiveIncludes = (needle, haystack) => haystack.toLowerCase().includes(needle.toLowerCase());


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
const Home = ({classes}) => {
  const [filename, setFilename] = useState('');
  const [json, setJson] = useState({});
  const [productNameContains, setProductNameContains] = useState('');
  const [matchingProduct, setMatchingProduct] = useState(null);
  const [modifiedXmlUrl, setModifiedXmlUrl] = useState(null);
  return (
    <main className={classes.layout}>
      <Paper className={classes.paper}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Button
              component="label"
              variant="text"
              startIcon={<UploadFileIcon />}
              fullWidth
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
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Shared Product Name Text"
              value={productNameContains}
              onChange={({target: {value}}) => {setProductNameContains(value)}}
              onKeyDown={({key}) => {
                if(key === "Enter"){
                  findAndSetMatchingProduct(json, productNameContains, setMatchingProduct);
                }
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() => {
                findAndSetMatchingProduct(json, productNameContains, setMatchingProduct);
              }}
              fullWidth
            >
              Submit
            </Button>
          </Grid>
        </Grid>
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
            <Grid container spacing={24}>
              <Grid item xs={12}>
                <TextField
                  name="Description"
                  label="Description"
                  defaultValue={matchingProduct.Description}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Calculated_Price"
                  label="Price"
                  defaultValue={matchingProduct.Calculated_Price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Fixed_Shipping_Price"
                  label="Shipping Price"
                  defaultValue={matchingProduct.Fixed_Shipping_Price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="Weight"
                  label="Weight"
                  defaultValue={matchingProduct.Weight}
                  InputProps={{
                    endAdornment: <InputAdornment position="start">g</InputAdornment>,
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  type="submit"
                  fullWidth
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Box>
        }
        {
          modifiedXmlUrl &&
          <a href={modifiedXmlUrl} download={`${filename}-modified`}>
            <Button
              variant="contained"
              fullWidth
            >
              Download Modified XML
            </Button>
          </a>
        }
      </Paper>
    </main>
  );
}

export default withStyles(styles)(Home);
