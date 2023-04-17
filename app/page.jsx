'use client'
import {useState} from 'react';
import {parseString} from 'xml2js';

export default function Home() {
  const [json, setJson] = useState({});
  const [productNameContains, setProductNameContains] = useState('Black Anodized Billet Aluminum Button');
  const [matchingProduct, setMatchingProduct] = useState(null);
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
                console.log(fileJson);
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
        matchingProduct && <div>
          <h1>Products whose names contain: {productNameContains}</h1>
          Description:
          <textarea type="text" value={matchingProduct.Description} style={{width: '500px'}} />
          <br />
          Price:
          <input type="text" value={matchingProduct.Calculated_Price} />
          <br />
          Shipping Price:
          <input type="text" value={matchingProduct.Fixed_Shipping_Price} />
          <br />
          Weight:
          <input type="text" value={matchingProduct.Weight} />
        </div>
      }
    </div>
  )
}
