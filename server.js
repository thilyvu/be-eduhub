const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { PORT, mongoUri } = require("./config/config");
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const morgan = require("morgan");
app.use(cors());
app.use(morgan("tiny"));
app.use(
  express.json({
    extended: true,
    limit: "50mb",
  })
);
app.use(passport.initialize());

require("./middleware/passport")(passport);
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(console.log("Mongodb database connected... "))
  .catch((err) => console.log(err));

app.use("/api", require("./router/api/users"));
app.use("/api", require("./router/api/class"));
app.use("/api", require("./router/api/calendar"));
app.use("/api", require("./router/api/lecture"));
app.use("/api", require("./router/api/pool"));
app.use("/api", require("./router/api/newFeed"));
app.use("/api", require("./router/api/comment"));
app.use("/api", require("./router/api/exercise"));
app.use("/api", require("./router/api/notification"));
app.use("/api", require("./router/api/questionType"));
app.use("/api", require("./router/api/score"));
app.use("/api", require("./router/api/test"));
app.use("/api", require("./router/api/studentKey"));
app.use("/api", require("./router/api/fileFolder"));
app.use("/api", require("./router/api/masterData/grade"));
app.use("/api", require("./router/api/masterData/subject"));
app.use((req, res) => {
  res.status(404).send({ url: `${req.originalUrl} not found` });
});

app.listen(PORT, () =>
  console.log(`app listening at http://localhost:${PORT}`)
);
