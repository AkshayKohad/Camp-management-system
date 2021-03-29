if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const Joi = require("joi")
const session = require("express-session")
const ExpressError = require("./utils/ExpressError")
const methodOverride = require("method-override")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const MongoStore = require("connect-mongo")

//const MongoDBStore = require("connect-mongo");

//const dbUrl = process.env.DB_URL

//'mongodb://localhost:27017/yelp-camp' --> for local database
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,   
    useUnifiedTopology: true, 
    useCreateIndex:true,
    useFindAndModify:false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database Connected");
});
   

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine","ejs")
app.set("views",path.join(__dirname, "views"))

app.use(express.urlencoded({ extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,"public")))
app.use(mongoSanitize())
//or 
// app.use(mongoSanitize({
 //   replaceWith: "_"
//}))

// app.use(session({
//     secret: "thisshouldbeabettersecret!",
//     store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/yelp-camp' }),
//     touchAfter: 24 * 60 * 60
//   }));

  const store = MongoStore.create({
    mongoUrl: 'mongodb://localhost/test-app',
    touchAfter: 24 * 60 * 60,
    crypto: {
      secret: "thisshouldbeabettersecret!"
    }
  })

  store.on("error", function (e){
      console.log("SESSION STORE ERROR", e)
  })
  
const sessionConfig = {
    store,
    name: "session",
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7, //for eg extended till week
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({contentSecurityPolicy: false}))

app.use(passport.initialize())
app.use(passport.session()) //your session should be there before passport session
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
   // console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.get("/fakeUser", async (req,res)=>{
    const user = new User({ email: "coltttt@gmail.com", username: "coltttt"})
    const newUser = await User.register(user, "chicken")
    res.send(newUser)
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)


app.get("/", (req,res) => {
    res.render("home")
 //res.send("Hello from Yelp Camp!")
})

app.get("/makecampground",async (req,res)=>{
    const camp = new Campground({
        title:"My Backyard",
        description: "cheap camping!"
    })
    await camp.save()
    res.send(camp)
    //res.render("home")
})



app.use("*",(req,res,next)=>{
    next(new ExpressError("page Not Found",404))
})
app.use((err,req,res,next)=>{
    const { statusCode = 500, message = "something went wrong" }=err
    res.status(statusCode).render("error",{err})
 //   res.send("OH boy, we got An error!!!")
})

app.listen(3000,()=>{
    console.log("serving on port 3000")
})

