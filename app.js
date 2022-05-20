//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://boostry:Test-123@cluster0.6xn6j.mongodb.net/todolistDB")
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

// const item1 = new Item({
//   name: "welcome to your todoList"
// });
// const item2 = new Item({
//   name: "Hit the + button to add a new item"
// });
// const item3 = new Item({
//   name: "<-- Hit this to delete an item"
// });

// const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)
const listNames = [] // a list of the newly created lists names




app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {

      List.find({}, (err, resault) => {
        if (!err) {
          resault.forEach((object) => {
            if (!listNames.includes(object.name) && object.name !== "Favicon.ico") {
              listNames.push(object.name)
              
            }
          })
        }
        if (!listNames.includes("Main page")) {
          listNames.push("Main page")
        }
        res.render("main", { listTitle: "Main page", newListItems: foundItems, listIn: listNames })
      })
      
    
  });
  


});

app.get("/:paramName", (req, res) => {
  const paramName = _.capitalize(req.params.paramName);


  List.find({}, (err, resault) => {
    if (!err) {
      resault.forEach((object) => {
        if (!listNames.includes(object.name) && object.name !== "Favicon.ico") {
          listNames.push(object.name)
        }
      })
    }
    
  })

  List.findOne({ name: paramName }, (err, resault) => {
    if (!err) {
      if (!resault) {
        const list = new List({
          name: paramName,
          // items: defaultItems
        });
        list.save();
        res.redirect("/" + paramName)
      } else {
        res.render("list", { listTitle: resault.name, newListItems: resault.items, listIn: listNames })
      }
    }
  });
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(newItem)
      foundList.save();
      res.redirect("/" + listName);
    })

});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log("item removed")
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }

})

app.post("/redirect", (req, res) => {
  const redirected = req.body.redirect;
if (redirected !== "Main page"){
  res.redirect("/" + redirected)
}else{
  res.redirect("/")
}
})

app.post("/addName", (req, res) => {
  const listName = req.body.addName
  if (listNames.length < 15){
    console.log("new list have been made name: "+listName)
    res.redirect("/" + listName)
  }else{
    console.log("can't create new list , list is full")
  }
 
  
})

app.post("/removeList", (req, res) => {
  const listName = req.body.removeList;

List.findOneAndDelete({name: listName},(err)=>{
  if(err){
    console.log(err)
  }else{
    const indexOfListName = listNames.indexOf(listName)
    listNames.splice(indexOfListName)
    console.log("removed "+listName)
    res.redirect("/")
  }
})
})



app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started success");
});
