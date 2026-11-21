import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5500;
const SANDBOX_URL = "https://sandbox.safaricom.co.ke";

//allow react kumake request kwa backend server
app.use(cors());
app.use(express.json());

// napata token ya daraja kwanza ndio request ikubaliwe isione mimi ni imposter
async function fetchToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(key + ":" + secret).toString("base64");

  const res = await fetch(
    SANDBOX_URL + "/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: "Basic " + auth,
      },
    }
  );

  if (!res.ok) {
    throw new Error("token haikupatikana");
  }

  const data = await res.json();
  return data.access_token;
}

// timestamp ya YYYYMMDDHHmmss
function getStamp() {
  const d = new Date();
  const pad = (num) => String(num).padStart(2, "0");

  return (
    String(d.getFullYear()) +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

// kubadilisha namba ianze na 254
function cleanKenyanPhone(rawPhone) {
  const trimmed = String(rawPhone || "").trim();
  if (trimmed.startsWith("0")) {
    return "254" + trimmed.slice(1);
  }
  if (trimmed.startsWith("+")) {
    return trimmed.slice(1);
  }
  return trimmed;
}

// kutuma stk push kwa simu
app.post("/api/mpesa/stkpush", async function (req, res) {
  const phone = cleanKenyanPhone(req.body.phone);
  const amount = Math.round(Number(req.body.amount));
  const label = String(req.body.packageTitle || "SoftLife").slice(0, 13);

  if (!phone || !amount) {
    return res.status(400).json({
      success: false,
      message: "weka namba na amount sawa",
    });
  }

  try {
    const token = await fetchToken();
    const shortcode = process.env.MPESA_SHORTCODE || "174379";
    const passkey = process.env.MPESA_PASSKEY;
    const timestamp = getStamp();
    //build the daraja password
    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL:
        process.env.MPESA_CALLBACK_URL ||
        "https://example.com/api/mpesa/callback",
      AccountReference: "SoftLife",
      TransactionDesc: label,
    };

    const stkRes = await fetch(
      SANDBOX_URL + "/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode !== "0") {
      return res.status(400).json({
        success: false,
        message: stkData.errorMessage || "stk haikuenda",
      });
    }

    return res.json({
      success: true,
      checkoutRequestId: stkData.CheckoutRequestID,
      customerMessage: stkData.CustomerMessage,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "kuna shida kwa server",
    });
  }
});

// safaricom wakirudisha callback imekua received customer aki maliza ama a cancel
app.post("/api/mpesa/callback", function (req, res) {
  console.log("callback:", req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
});

//inaskiza ma request sasa
app.listen(PORT, function () {
  console.log("server iko juu on port " + PORT);
});

