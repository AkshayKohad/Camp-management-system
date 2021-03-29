const mongoose = require("mongoose")
const Campground = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex:true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database Connected");
});
  
const sample = (array) => array[Math.floor(Math.random() * array.length)]
const seedDB = async ()=>{
    await Campground.deleteMany({})
    for(let i=0;i<300;i++)
    {
        const random1000 = Math.floor(Math.random()* cities.length)
        const price = Math.floor(Math.random()*20)+10
        const camp = new Campground({
          // never delete this author ID given below  
          author: "6046f63b40dbf432dc2bec4c",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
             title: `${sample(descriptors)} ${sample(places)}`,
             description: "This is one of best campgrounds you would have ever experienced do try it to make your experience wonderful",
             price,
             geometry:{
               type: "Point",
               coordinates: [
                 cities[random1000].longitude,
                 cities[random1000].latitude,
               ]
             },
             images: [
                {
                  url: 'https://res.cloudinary.com/dkxgi9wv5/image/upload/v1616225150/YelpCamp/qsnhxluggacbntctbx2k.png',
                  filename: 'YelpCamp/qsnhxluggacbntctbx2k'
                },
                {
                  url: 'https://res.cloudinary.com/dkxgi9wv5/image/upload/v1616225178/YelpCamp/va6co5b822kfm28vaarc.png',
                  filename: 'YelpCamp/va6co5b822kfm28vaarc'
                }
              ]
        })
       await camp.save()
    }
 }

seedDB().then( ()=>{
    mongoose.connection.close()
});