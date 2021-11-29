const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const PORT = 3001;

const { encrypt, decrypt } = require("./EncryptionHandler");

app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "", //Write your own root password here
    database: "PasswordManager"
})

app.post("/addpassword", (req, res) => {
    const {password, title} = req.body;
    const hashedPassword = encrypt(password);
    db.query("INSERT INTO passwords (passwords, title, iv) VALUES (?,?,?)", 
    [hashedPassword.password, title, hashedPassword.iv], 
    (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.send("Success");
        }
    }
    
    );

});

app.get("/showpasswords", (req, res) => {
    db.query("SELECT * FROM passwords;", (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.delete("/deletepassword/:id", (req, res) => {
    db.query("DELETE FROM passwords WHERE id = ?", req.params.id, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.put("/updatepassword/:id", (req, res) => {

    const hashedPassword = encrypt(req.body.password);
    db.query("UPDATE passwords SET passwords = ?, iv = ? WHERE id = ?", [hashedPassword.password, hashedPassword.iv, req.params.id], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post("/decryptpassword", (req, res) => {
    res.send(decrypt(req.body));
});

app.listen(PORT, ()=> {
    console.log("Server is running");
});

