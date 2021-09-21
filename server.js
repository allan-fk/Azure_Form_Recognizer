import axios from "axios";
import pkg from "lodash";
const { mapValues, uniq } = pkg;
import img from "./image-list.js";
const imgList = img();
import dotenv from "dotenv";

dotenv.config();

axios
  .post(
    "https://francecentral.api.cognitive.microsoft.com/formrecognizer/v2.1-preview.3/prebuilt/receipt/analyze?pages=1",
    {
      source: imgList[6],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.API_KEY,
      },
    }
  )
  .then((res) => {
    setTimeout(() => {
      console.log(res.headers["operation-location"]);
      axios
        .get(res.headers["operation-location"], {
          headers: {
            "Ocp-Apim-Subscription-Key": process.env.API_KEY,
          },
        })
        .then((res) => {
          const data = res.data.analyzeResult.documentResults[0].fields;

          mapValues(data, (v, k) => {
            v.valueArray &&
              v.valueArray.map((v) => {
                const obj = v.valueObject;
                if (
                  obj.Name &&
                  obj.Name.text !== undefined &&
                  obj.TotalPrice &&
                  obj.TotalPrice.text !== undefined
                ) {
                  console.log(
                    "Produit :",
                    obj.Name.text,
                    " - ",
                    "Prix :",
                    obj.TotalPrice.text
                  );
                }
              });
            v.text && console.log(k, ": ", v.text);
          });
        });
    }, 5000);
  })
  .catch((error) => {
    console.error(error.response.status);
    console.error(error.response.statusText);
  });
