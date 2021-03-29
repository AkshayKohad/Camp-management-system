const express = require("express")
const router = express.Router()
const campgrounds = require("../controllers/campgrounds")
const catchAsync = require("../utils/catchAsync")
const {campgroundSchema} = require("../schemas")
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware")
const ExpressError = require("../utils/ExpressError")
const Campground = require("../models/campground")
const multer = require("multer")
const { storage} = require("../cloudinary/index")

// to store uploaded things in cloudinary
const upload = multer({ storage })
// used when we are storing the uploaded things in uploads folder
//const upload = multer({ dest: "uploads/"})

router.route("/")
    .get( catchAsync(campgrounds.index))
    .post( isLoggedIn, upload.array("image"),validateCampground, catchAsync(campgrounds.createCampground))
  
  //THIS IS FOR SINGLE UPLOAD
  // .post(upload.single("image"),(req, res)=>{
     //  console.log(req.body, req.file)
       // res.send("IT worked!!")
    //})

    //FOR MULTIPLE UPLOAD FILES
  //  .post(upload.array("image"),(req, res)=>{
    //    console.log(req.body, req.files)
       //  res.send("IT worked!!")
     //})
 

router.get("/new", isLoggedIn, campgrounds.renderNewForm) 

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground ,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports= router