import { ChangeEvent, useState } from "react";
import "./App.css";
import { useAuthContext } from "./hooks/useAuthContext";

const initialFormData: Record<string, string> = {
  name: "",
  email: "",
};

function App() {
  const [formData, setFormData] = useState(initialFormData);

  const { publicRSAKey, encryptAndSendData } = useAuthContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { name, email } = formData;

    if ((!name && !email) || !publicRSAKey) return;

    encryptAndSendData(JSON.stringify({ name, email }));

    setFormData(initialFormData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="name">
          <span>Name:</span>
          <input
            autoComplete="off"
            id="name"
            name="name"
            onChange={handleChange}
            type="text"
            value={formData.name}
          />
        </label>
      </p>
      <p>
        <label htmlFor="email">
          <span>Email:</span>
          <input
            autoComplete="off"
            id="email"
            name="email"
            onChange={handleChange}
            type="email"
            value={formData.email}
          />
        </label>
      </p>
      <button type="submit" disabled={!formData.email && !formData.name}>
        Submit
      </button>
    </form>
  );
}

export default App;
