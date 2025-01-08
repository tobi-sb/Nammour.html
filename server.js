const express = require("express");
const app = express();
// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51QeIGwFQND1i0vCyfQxvX81G0sa0saROpyGa6SYsAXV4P24BntDYmQHSE2hFpmWC0xrjEAN1shA1kUs3ztlL4Xnj00kX5dd2tn"
);

app.use(express.static("public"));
app.use(express.json());

const calculateOrderAmount = (items) => {
  try {
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid items array:", items);
      return 0;
    }

    console.log(
      "Calculating amount for items:",
      JSON.stringify(items, null, 2)
    );
    let total = 0;
    items.forEach((item) => {
      if (item && item.product && item.quantity > 0) {
        // Convert string amount (e.g. "25,00") to number
        let amount = item.product.pVal || 0;
        if (!amount && typeof item.product.pAmount === "string") {
          amount = parseFloat(item.product.pAmount.replace(",", ".")) || 0;
        }

        if (amount > 0) {
          const itemTotal = amount * item.quantity;
          console.log(
            `Item ${item.product.id}: ${item.quantity} x ${amount} = ${itemTotal}`
          );
          total += itemTotal;
        } else {
          console.warn("Invalid amount for item:", item.product.id);
        }
      } else {
        console.warn("Invalid item format:", JSON.stringify(item, null, 2));
      }
    });

    // Convert to cents for Stripe and ensure it's at least 50 cents (Stripe minimum)
    const amountInCents = Math.max(Math.round(total * 100), 50);
    console.log(`Total: ${total} EUR, Amount in cents: ${amountInCents}`);
    return amountInCents;
  } catch (error) {
    console.error("Error calculating order amount:", error);
    return 50; // Minimum amount as fallback
  }
};

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { items } = req.body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid request: empty or invalid items array");
      return res.status(400).json({
        error: {
          message: "Invalid request: items array is required",
        },
      });
    }

    console.log(
      "Processing payment intent for items:",
      JSON.stringify(items, null, 2)
    );

    const amount = calculateOrderAmount(items);
    console.log("Calculated amount in cents:", amount);

    // Validate calculated amount
    if (amount <= 0) {
      console.error("Invalid order amount:", amount);
      return res.status(400).json({
        error: {
          message: "Invalid order amount",
        },
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["card"],
      metadata: {
        items_count: items.length,
        total_amount_eur: (amount / 100).toFixed(2),
      },
    });

    console.log(
      `Payment intent ${paymentIntent.id} created successfully for amount ${amount} cents`
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: {
        message: "Error creating payment intent",
        details: error.message,
      },
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      details: err.message,
    },
  });
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
