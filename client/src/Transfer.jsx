import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak"
import { utf8ToBytes } from "ethereum-cryptography/utils"
import * as  secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils"



function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);


  function hashMessage(message) {
    const bytes = utf8ToBytes(message)
    const hash = toHex(keccak256(bytes))
    return hash
  }

  async function transfer(evt) {
    evt.preventDefault();

    //hashing msg
    const hashMssg = hashMessage("transaction")
    //signing
    const [signature, recoveryBit] = await secp.sign(hashMssg, privateKey, { recovered: true })


    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        hashMssg: hashMssg,
        recoveryBit: recoveryBit,
        signature: toHex(signature),
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }


  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
