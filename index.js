const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Rendera index-sidan för rot-routen
router.get('/', (req, res) => {
  res.render('index.ejs');
});

// Hantera användarregistrering
router.post('/', (req, res) => {
  const { email, username, password, passwordConf } = req.body;

  // Kontrollera om obligatoriska fält saknas
  if (!email || !username || !password || !passwordConf) {
    res.send();
  } else {
    // Kontrollera om lösenorden matchar
    if (password === passwordConf) {
      // Kontrollera om e-post redan används
      User.findOne({ email }, (err, data) => {
        if (!data) {
          // Generera ett unikt ID för den nya användaren
          User.findOne({}, (err, data) => {
            const unique_id = (data && typeof data.unique_id === 'number' && !isNaN(data.unique_id)) ? data.unique_id + 1 : 1;

            const newPerson = new User({
              unique_id,
              email,
              username,
              password,
              passwordConf
            });

            // Spara den nya användaren
            newPerson.save((err, person) => {
              if (err) console.log(err);
              else console.log('Lyckades');
            });

          }).sort({_id: -1}).limit(1);

          res.send({"Success": "Du är registrerad. Du kan logga in nu."});
        } else {
          res.send({"Success": "E-post används redan."});
        }
      });
    } else {
      res.send({"Success": "Lösenord matchar inte"});
    }
  }
});

// Rendera login-sidan för /login-routen
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

// Hantera användarlogin
router.post('/login', function (req, res, next) {
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				req.session.userId = data.unique_id;
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

// Rendera profile-sidan för /profile-routen
router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});


// Hantera användarlogout
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return next(err);
      else return res.redirect('/');
    });
  }
});

// Rendera forget password-sidan för /forgetpass-routen
router.get('/forgetpass', (req, res) => {
  res.render("forget.ejs");
});

// Hantera forget password-förfrågan
router.post('/forgetpass', (req, res) => {
  User.findOne({ email: req.body.email }, (err, data) => {
    if (!data) {
      res.send({"Success": "Denna e-post är inte registrerad!"});
    } else {
      if (req.body.password === req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        // Spara det uppdaterade lösenordet
        data.save((err, person) => {
          if (err) console.log(err);
          else console.log('Lyckades');
          res.send({"Success": "Lösenord ändrat!"});
        });
      } else {
        res.send({"Success": "Lösenorden matchar inte! Båda lösenorden bör vara samma."});
      }
    }
  });
});

module.exports = router;
