var express = require("express");
var router = express.Router();
var User = require("../models/user");

router.get("/", function (req, res, next) {
  return res.render("index.ejs");
});

router.post("/", function (req, res, next) {
  console.log(req.body);
  var personInfo = req.body;

  if (
    !personInfo.email ||
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send();
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ email: personInfo.email }, function (err, data) {
        if (!data) {
          var c;
          User.findOne({}, function (err, data) {
            if (data) {
              console.log("if");
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            var newPerson = new User({
              unique_id: c,
              email: personInfo.email,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf,
            });

            newPerson.save(function (err, Person) {
              if (err) console.log(err);
              else console.log("Success");
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          res.send({
            Success: "Bạn đã được đăng ký , Bạn có thể đăng nhập ngay bây giờ.",
          });
        } else {
          res.send({ Success: "Email đã được sử dụng." });
        }
      });
    } else {
      res.send({ Success: "mật khẩu không khớp" });
    }
  }
});

router.get("/login", function (req, res, next) {
  return res.render("login.ejs");
});

router.get("/profile", function (req, res, next) {
  console.log("profile");
  User.findOne({ unique_id: req.session.userId }, function (err, data) {
    console.log("data");
    console.log(data);
    if (!data) {
      res.redirect("/");
    } else {
      console.log("found");
      return res.render("data.ejs", { name: data.username, email: data.email });
    }
  });
});

router.post("/login", function (req, res, next) {
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    if (data) {
      if (data.password == req.body.password) {
        //console.log("Done Login");
        req.session.userId = data.unique_id;
        //console.log(req.session.userId);
        res.send({ Success: "Success!" });
        // res.redirect("/profile");
      } else {
        res.send({ Success: "Sai mật khẩu!" });
      }
    } else {
      res.send({ Success: "Email chưa được đăng ký!" });
    }
  });
});

router.get("/logout", function (req, res, next) {
  console.log("logout");
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

router.get("/forgetpass", function (req, res, next) {
  res.render("forget.ejs");
});

router.post("/forgetpass", function (req, res, next) {
  //console.log('req.body');
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function (err, data) {
    console.log(data);
    if (!data) {
      res.send({ Success: "Email này chưa được đăng ký !" });
    } else {
      // res.send({"Success":"Success!"});
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err) console.log(err);
          else console.log("Success");
          res.send({ Success: "mật khẩu đã được thay đổi!" });
        });
      } else {
        res.send({
          Success: "Mật khẩu không khớp! Cả hai mật khẩu phải giống nhau.",
        });
      }
    }
  });
});

module.exports = router;
