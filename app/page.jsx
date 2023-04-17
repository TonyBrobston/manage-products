'use client'
import {useState} from 'react';
import {Builder, parseString} from 'xml2js';

export default function Home() {
  const [json, setJson] = useState({});
  const [productNameContains, setProductNameContains] = useState('Black Anodized Billet Aluminum Button');
  const [matchingProduct, setMatchingProduct] = useState(null);
  const [modifiedJson, setModifiedJson] = useState({});
  return (
    <div>
      <label htmlFor="xmlInput">Update product XML File:</label>
      <input
        id="xmlInput"
        type="file"
        accept="text/xml"
        onChange={({target: {files}}) => {
          if (files) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = ({target: {result}}) => {
              parseString(result, function (error, fileJson) {
                setJson(fileJson);
              });
            }
            reader.readAsText(file)
          }
        }}
      />
      <br />
      <label htmlFor="productNameContains">Product Name Contains:</label>
      <input id="productNameContains" type="text" value={productNameContains} onChange={({target: {value}}) => {setProductNameContains(value)}} />
      <br />
      <input type="button" value="Submit" onClick={() => {
        const matchingProducts = json.products.product.filter(({Name}) => Name[0].includes(productNameContains));
        const matchingProduct = JSON.parse([...new Set(matchingProducts.map(({Product_ID, Product_URL, Page_Title, Name, ...rest}) => JSON.stringify(rest)))][0]);
        setMatchingProduct(matchingProduct);
      }} />
      {
        matchingProduct && <form onSubmit={(event) => {
          event.preventDefault()
          const formData = new FormData(event.target);
          const formProps = Object.fromEntries(formData);
          const formPropsAsArrays = Object.entries(formProps).reduce((accumulator, [key, value]) => ({...accumulator, [key]: [value]}), {});
          console.log('json:', JSON.stringify(json, null, 2));
          const modifiedJson = {
            ...json,
            products: {
              product: [
                ...json.products.product.map((product) => {
                  if (product.Name[0].includes(productNameContains)) {
                    return {
                      ...product,
                      ...formPropsAsArrays,
                    }
                  }
                  return product;
                }),
              ],
            },
          };
          const xml = new Builder().buildObject(modifiedJson);
          console.log('xml:', xml);
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
    </div>
  )
}
