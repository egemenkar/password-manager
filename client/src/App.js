import './App.css';
import { useState, useEffect, useRef } from "react";
import Axios from "axios";

function App() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [passwordList, setPasswordList] = useState([]);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [id, setId] = useState("");
  const passRef = useRef();
  const titleRef = useRef();
  

  useEffect(() => {
    showPasswords();
  }, []);

  const addPassword = () => {
    Axios.post("http://localhost:3001/addpassword", {
      password: password, 
      title: title
    }).then(() => {
      showPasswords();
    });
    passRef.current.value = "";
    titleRef.current.value = "";
  };

  const showPasswords = () => {
    Axios.get("http://localhost:3001/showpasswords").then((response) => {
      setPasswordList(response.data);
    });
  };

  const updatePassword = (id) => {
    const newPassword = prompt("Enter new password: ");

    Axios.put(`http://localhost:3001/updatepassword/${id}`, { password: newPassword }).then(() => {
      showPasswords();
    })
    .catch(err => {
      console.log(err);
    });
  };

  function deletePassword(id) {
    Axios.delete(`http://localhost:3001/deletepassword/${id}`).then(
      () => {
        setPasswordList(
          passwordList.filter((val) => {
            return val.id !== id;
          })
        );
      }
    );
  }

  const decryptPassword = (encryption) => {
    Axios.post("http://localhost:3001/decryptpassword", { 
      password: encryption.password, 
      iv: encryption.iv
    }).then((response) => {
      setPasswordList(passwordList.map((val) => {
        return val.id === encryption.id 
        ? {
            id : val.id,
            password: val.passwords, 
            title: response.data, 
            iv: val.id
          } 
        : val;
      }));
    });
  };

  const handleBtn = (id) => {
    setId(id);
  }

  return (
    <div className="App">
      <div className="AddingPassword">
        <input 
          type="text" 
          ref={passRef}
          placeholder="Ex. password123" 
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
        <input 
          type="text" 
          ref={titleRef}
          placeholder="Ex. Facebook"
          onChange={(event) => {
            setTitle(event.target.value);
          }} 
        />
        <button onClick={addPassword}> Add Password </button>
      </div>
      
      <div className="Passwords">
          {passwordList.map((val, key) => {
            return( 
            <div className="password" key={key} >
              <h3>{val.title}</h3> 
              <div>
                <button id="show" onClick={() => {
                  if(!isDecrypted) {
                    decryptPassword({password: val.passwords, iv: val.iv, id: val.id});
                    setIsDecrypted(true);
                  } else {
                    showPasswords();
                    setIsDecrypted(false);
                  };
                    handleBtn(val.id);
                  }
                }>{id === val.id ? !isDecrypted ? "SHOW" : "HIDE" : "SHOW"}</button>
                <button id="update" onClick={() => updatePassword(val.id)}>UPDATE</button>
                <button id="delete" onClick={() => deletePassword(val.id)}>X</button>
              </div>
            </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
