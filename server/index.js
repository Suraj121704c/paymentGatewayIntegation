const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let salt_key = "96434309-7796-489d-8924-ab56988a6076";
let merchant_id = 'PGTESTPAYUAT86';

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.post("/order", async (req, res) => {
    try {
        let merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            name: req.body.name,
            amount: req.body.amount * 100,
            redirectUrl: `http://localhost:5000/status?id=${merchantTransactionId}`,
            redirectMode: "POST",
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };

        // Encode payload as Base64
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString("base64");

        // Generate checksum
        const keyIndex = 1;
        const string = payloadMain + "/pg/v1/pay" + salt_key;
        const sha256 = crypto.createHash("sha256").update(string).digest("hex");
        const checksum = sha256 + `###` + keyIndex;

        // const production = https://api.phonepe.com/apis/hermes // change it at the time of integration in real time
        const prod_Url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

        const options = {
            method: "POST",
            url: prod_Url,
            headers: {
                accept: "application/json",
                'Content-Type': "application/json",
                "X-VERIFY": checksum,
            },
            data: {
                request: payloadMain,
            },
        };

        const response = await axios(options);
        console.log("PhonePe Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});

app.post("/status", async (req, res) => {
    const merchantTransactionId = req.query.id;
    const merchantId = merchant_id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checkSum = sha256 + "###" + keyIndex;

    const options = {
        method: "GET",
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            'Content-Type': "application/json",
            "X-VERIFY": checkSum,
            "X-MERCHANT-ID": `${merchantId}`
        }
    }

    axios.request(options).then(function (response) {
        if(response.data.success === true){
            const url = "http://localhost:5173/success";
            return res.redirect(url)
        }else{
            const url = "http://localhost:5173/fail";
            return res.redirect(url)
        }
    }).catch(function (error) {
        console.log(error)
    })
})

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
