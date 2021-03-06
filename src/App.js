import React, { useEffect, useRef, useState } from "react";
import './App.css';

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCyLXSU7XRdR04EGi1Nl8X3KJj1zCJvWbE",
  authDomain: "chitchat-f258e.firebaseapp.com",
  projectId: "chitchat-f258e",
  storageBucket: "chitchat-f258e.appspot.com",
  messagingSenderId: "501738083204",
  appId: "1:501738083204:web:b43f9886b411efdda703d1",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChitChat 💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <div>
      <button onClick={signInWithGoogle}>SignIn with Google</button>
    </div>
  );
}
function SignOut() {
  return (
    auth.currentUser && (
      <div>
        <button className="signOutBtn" onClick={() => auth.signOut()}>
          SignOut
        </button>
      </div>
    )
  );
}
function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt", "asc").limitToLast(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const { displayName, uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Say something"
        />
        <button type="submit" disabled={!formValue}>
          send
        </button>
      </form>
    </div>
  );
}
function ChatMessage(props) {
  const { user, body, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            "https://i.pinimg.com/originals/3e/51/b7/3e51b7003375fb7e9e9c233a7f52c79e.png"
          }
          alt="{user}'s pfp"
        />
        <p>{body}</p>
      </div>
    </div>
  );
}

export default App;
