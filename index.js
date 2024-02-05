const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_PROJECT_URL,
  process.env.SUPABASE_API_KEY,
);

const app = express();

app.use(express.json());

const SECRET_TOKEN = process.env.SECRET_TOKEN;

// - MIDDLEWARE---------
const validateToken = (req, res, next) => {
  const token = req.headers.authorization;

  // Check if the Authorization header is present
  if (!token) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }

  // Validate the token
  if (token !== `Bearer ${SECRET_TOKEN}` || !SECRET_TOKEN) {
    return res.status(401).json({ message: "Invalid Bearer token" });
  }

  next();
};

async function getLatestRecord() {
  const { data, error } = await supabase
    .from("pings")
    .select()
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.log(error);
    throw error;
  }

  if (data && data.length > 0) {
    const latestRecord = data[0];
    return latestRecord;
  } else {
    return {
      created_at: new Date().toISOString(),
      city: "Somewhereville",
      region: "Someplace",
      country: "Somewhereland",
      timezone: "Timeless",
      lat: 0,
      lon: 0,
    };
  }
}

// - ROUTES------------

app.get("/", (_req, res) => {
  res.send("OK");
});

app.get("/latest", validateToken, async (_req, res) => {
  try {
    const data = await getLatestRecord();

    const { created_at, city, region, country, timezone, lat, lon } = data;
    const formatted = {
      updated_at: new Date(created_at).toISOString(),
      location: {
        city,
        region,
        country,
        timezone,
        lat,
        lon,
      },
    };
    res.send(formatted);
  } catch (e) {
    res.status(500).send({ message: "Something went wrong :(" });
    console.log(e);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
