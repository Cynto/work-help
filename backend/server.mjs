import { createServer } from "node:http";
import mongoose, { connect } from "mongoose";
import bodyParser from "body-parser";

const nameSchema = new mongoose.Schema({
  name: String,
});

const Name = mongoose.model("Name", nameSchema);

const connectToDB = async () => {
  try {
    await mongoose.connect("mongodb://mongo:27017/test");

    console.log("Connection has been established successfully.");
    return true;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return false;
  }
};

let connected = connectToDB();

const server = createServer(async (req, res) => {
  // Check if the request is a POST request to "/endpoint"
  if (req.method === "POST" && req.url === "/endpoint" && connected) {
    // Use bodyParser middleware to parse JSON bodies
    bodyParser.json()(req, res, async () => {
      console.log(req.url, req.method, req.body);

      if (req.body) {
        await Name.deleteMany({});
        const newName = new Name({ name: req.body.name });
        let saveResult = await newName.save();
        if (saveResult) {
          res.statusCode = 201;
          res.setHeader("Content-Type", "text/plain");
          res.write("Name successfully added to mongo database");
        } else {
        }
        res.end();
      } else {
        res.statusCode = 400; // Bad Request
        res.setHeader("Content-Type", "text/plain");
        res.end("Invalid request body");
      }
    });
  } else if (connected) {
    // Handle other routes or methods
    const result = await Name.findOne({}, {}, { sort: { createdAt: -1 } });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result.name));
  } else if (!connected) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Connection to mongo DB was unsuccessful");
  }
});

server.listen(process.env.PORT || 3000);
