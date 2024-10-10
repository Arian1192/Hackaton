const SentimentCard = ({ sentiment, message, count }) => {

  return (
    <div className={`w-96 h-96 flex shadow-lg flex-col  justify-center items-center border rounded-lg bg-gradient-to-r ${sentiment === "Positive" ? "from-cyan-400 via-blue-300 to-green-500 ":"from-red-400 via-orange-500 to-rose-600 " } text-white p-4`}>
      <h1 className="text-2xl font-bold">{sentiment} Messages</h1>
      <div className="text-8xl font-extrabold mt-4">
        {count}
      </div>
      <p className="text-lg">Last message: {message}</p>
    </div>
  )
}

export default SentimentCard;
