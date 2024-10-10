import { useState, useEffect } from "react";
import SentimentCard from "./SentimentCard";

const WebSocketComponent = () => {
 const [positiveMessages, setPositiveMessages] = useState([]);
const [negativeMessages, setNegativeMessages] = useState([]);


  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (e) => {
      const {message, sentiment} = JSON.parse(e.data);
      console.log(message, sentiment);
      if(sentiment === "POSITIVE"){
        setPositiveMessages(prevMessages => [...prevMessages, message]);
      }else{
        setNegativeMessages(prevMessages => [...prevMessages, message]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl">WebSocket Messages</h1>
      <div className="w-[100%] h-screen flex flex-col md:flex-row justify-center items-center gap-10">
        <SentimentCard sentiment="Positive" message={positiveMessages[positiveMessages.length - 1]} count={positiveMessages.length} />
        <SentimentCard sentiment="Negative"  message={negativeMessages[negativeMessages.length - 1]} count={negativeMessages.length} />
      </div>
    </div>
  );
};

export default WebSocketComponent;
