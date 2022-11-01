/*
 *---------- GLOBAL ----------
 */

global.rootDir = __dirname;

require("dotenv").config();

global.mongoCredentials = {
  user: process.env.DB_USER,
  pwd: process.env.DB_PSW,
};
global.dbName = process.env.DB_NAME;

//!!!USARE QUESTO URI PER LE MACCHINE DEL DIPARTIMENTO
//global.mongouri = `mongodb://${global.mongoCredentials.user}:${global.mongoCredentials.pwd}@${global.mongoCredentials.site}?writeConcern=majority`;
global.mongouri = `mongodb+srv://site212222:${global.mongoCredentials.pwd}@users.ctus6cf.mongodb.net/Animal_House?retryWrites=true&w=majority`;
/*
 *---------- GENERAL SETUP ----------
 */
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { engine } = require("express-handlebars");
const path = require("path");
const connectDB = require("./db/connect");
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

require("express-async-errors");

const login_routes = require(path.join(__dirname, "routes", "login.js"));
const admin_routes = require(path.join(__dirname, "routes", "admin.js"));
const api_routes = require(path.join(__dirname, "api", "routes.js"));

const app = express();

app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/data", express.static(path.join(__dirname, "public", "data")));
app.use("/docs", express.static(path.join(__dirname, "public", "html")));
app.use("/img", express.static(path.join(__dirname, "public", "media")));
app.use("/views", express.static(path.join(__dirname, "public", "views")));
app.use("/tpl", express.static(path.join(__dirname, "tpl")));
app.use(express.static(path.join(__dirname, "build")));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.enable("trust proxy");

global.imgPath = path.join(__dirname, "img");

/*
 *---------- HANDLEBARS ----------
 */

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    helpers: {
      inc(value) {
        return parseInt(value) + 1;
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/public/views/");

/*
 *---------- SESSION SETUP ----------
 */

const sessionStore = new MongoStore({
  mongoUrl: global.mongouri,
  dbName: global.dbName,
});

app.use(
  session({
    secret: "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 100 * 60 * 60 * 24, // 1 day
    },
  })
);

/*
 *---------- PASSPORT AUTHENTICATION ----------
 */

require(__dirname + "/scripts/passport-config.js");
app.use(passport.initialize());
app.use(passport.session());

/*
 *---------- ROUTES ----------
 */

app.use("/", login_routes);
app.use("/admin", admin_routes);
app.use("/api/v1", api_routes);
/* Da usare sempre come ultimo */
app.use(notFound);
app.use(errorHandlerMiddleware);

/* 
// TODO: Resolve /login and / conflict between game and backoffice
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
}); 
*/

/*
 *---------- SERVER ----------
 */
const port = 8000;

const start = async () => {
  try {
    await connectDB(process.env.DB_URL);
    app.listen(port, () => console.log(`app listening on port ${port}!`));
  } catch (error) {
    console.log(error);
  }
};

start();
