import { useRef } from "react";
import "./App.css";
import { useAuthContext } from "./hooks/useAuthContext";

function App() {
  const emailRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { publicRSAKey, encryptAndSendData } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current || !emailRef.current || !publicRSAKey) return;

    const { value: name } = inputRef.current;
    const { value: email } = emailRef.current;

    encryptAndSendData(JSON.stringify({ name, email }));

    inputRef.current!.value = "";
    emailRef.current!.value = "";
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="name">
          Name: <input id="name" name="name" ref={inputRef} type="text" />
        </label>
      </p>
      <p>
        <label htmlFor="email">
          Email: <input id="email" name="email" ref={emailRef} type="email" />
        </label>
      </p>
      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
