import axios from 'axios'

function App() {
  let data = {
    name: "Suraj Singh",
    amount: 1,
    number: '6387389485',
    MID: 'MID' + Date.now(),
    transactionId: 'T' + Date.now()
  }

  const handleClick = async () => {
    try {
      await axios.post("http://localhost:5000/order", data).then((res) => {
        console.log(res.data);
        if(res.data.success === true){
          window.location.href = res.data.data.instrumentResponse.redirectInfo.url
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <button onClick={handleClick}>Pay Now</button>
    </>
  )
}

export default App
