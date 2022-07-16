import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {CButton, CCol, CFormGroup, CInput, CRow, CSelect } from '@coreui/react';
import { connect, connectSuccess } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import Select from 'react-select';
import FontAwesomes from "./Fonts";

const truncate = (input, len) => {
  if(input !== null)
    input.length > len ? `${input.substring(0, len)}...` : input;
}

function App() {
  const dispatch = useDispatch();

  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [defaultAccount, setDefaultAccount] = useState("");
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(0.1);
  const [mintCount, setMintCount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: true,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(parseFloat(mintAmount) - parseFloat("0.10"));
    setMintCount(mintCount - 1);
  };

  const incrementMintAmount = () => {
    console.log("Incremented")
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(parseFloat(mintAmount) + parseFloat("0.10"));
    setMintCount(mintCount + 1);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      console.log("blockchain", blockchain);
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    let config = await configResponse.json();
    // config.CONTRACT_ADDRESS = defaultAccount;
    // config.SCAN_LINK=`https://polygonscan.com/token/${defaultAccount}`;
    SET_CONFIG(config);
    setDefaultAccount(config.CONTRACT_ADDRESS);
  };

  const handleConnect = async (e) => {
      e.preventDefault();
      dispatch(connect());
      getData();
      
  }

  const getAccount = async() => {
    if(window.ethereum){
      window.ethereum.request({method:'eth_requestAccounts'})
      .then(result => {
        //setDefaultAccount(result[0]);
        console.log("eth_requestAccounts",result);
        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        setClaimingNft(true);
      })
    }else{
      setErrMessag("Please install metamask.")
    }
  }

  const formatDisplay = (id) => {
    //console.log("account", id);
    return `${id.substring(0,6)  + _maskInput(id.substring(7, id.length), '*', 4) }`
  }

  const _maskInput = (str, mask, n = 1) =>{
    // Slice the string and replace with mask then add remaining string
    return ('' + str).slice(0, -n)
        .replace(/./g, mask)
        + ('' + str).slice(-n);
}

  useEffect(() => {
    getAccount();
    if (typeof window.ethereum !== "undefined") {
      console.log("Injected Web3 Wallet is installed!");
    }
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);



  return (
    <s.Screen>
      <s.Container 
        flex={1}
        ai={"center"}
        style={{ padding: 24, 
          backgroundColor: "black",
          backgroundRepeat:"no-repeat",
          backgroundSize: "cover",
          // backgroundImage: `url(${"https://gifer.com/embed/O7o1"})` 
        }}
      >        
        <s.ResponsiveWrapper 
          flex={1} 
          style={{ 
            backgroundColor:"transparent" ,
            height: "100%",
            width:"100%", 
          }} 
          >
          <s.Container
            backgroundColor="transparent"
            flex={1}
            jc={"center"}
            ai={"center"}
            style={{
              /* Full height */
              height: "100vh",
              width:"100%",
              backgroundPosition:"center",
              backgroundRepeat:"no-repeat",
              backgroundSize: "cover",
              backgroundImage:`url(${"/config/images/logo4.jpeg"})` // "/config/images/logo.png"
            }}
          >
          <s.TextTitle
            style={{
              textAlign: "center",
              fontSize: 60,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          > METABUILDZ
          </s.TextTitle>
          <s.TextDescription
            style={{ textAlign: "center", color: "var(--accent-text)" }}
          >
            LET'S METABUILDZ YOUR DREAMS!
          </s.TextDescription>

            <s.SpacerMedium />
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{ textAlign: "center", color: "var(--accent-text)" }}
            >
              {formatDisplay(CONFIG.CONTRACT_ADDRESS)}
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >
              <s.StyledButton
                onClick={(e) => {
                  window.open(CONFIG.MBZ_ROADMAP, "_blank");
                }}
                style={{
                  margin: "5px",
                }}
              >
                Roadmap
              </s.StyledButton>
              <s.StyledButton
                style={{
                  margin: "5px",
                }}
                onClick={(e) => {
                  window.open(CONFIG.MARKETPLACE_LINK, "_blank");
                }}
              >
                {CONFIG.MARKETPLACE}
              </s.StyledButton>
            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Whitelist Sale : 0.1 ETH <br/> Public Sale: 0.2 ETH
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                <s.StyledButton
                  onClick={handleConnect}
                >
                { blockchain.account !== null ? "CONNECTED" : "CONNECT"}
                </s.StyledButton>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    
                    { blockchain.errorMsg !== "" ?
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg !== ""? blockchain.errorMsg: blockchain.account}
                        </s.TextDescription>
                      </>
                     :""} 
                  </s.Container>
                ) : (
                  <>
                    <s.SpacerMedium />
                    <s.MintingView>
                          <CButton 
                            style={{"width":"30px", "height":"40px"}}
                            disabled={ mintCount === 3}
                            onClick={ incrementMintAmount }>
                            +
                          </CButton>
                          <CInput 
                            style={{"width":"40px", "height":"40px", "textAlign":"center"}}
                            value={ mintCount }
                          />
                          <CButton 
                            style={{"width":"30px", "height":"40px"}}
                            disabled={ mintCount === 1}
                            onClick={decrementMintAmount}>
                            -
                          </CButton>

                          <s.StyledButton

                            padding="10px"
                            style={{"width":"150px",
                            "backgroundColor":"skyblue",
                            }}
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              claimNFTs();
                              getData();
                            }}>
                              <FontAwesomes icon="faDiamond" size="sm" style={{ marginRight: 5}} />
                            {`Mint (${ parseFloat(mintAmount.toFixed(2))} ETH)`}
                          </s.StyledButton>



                    </s.MintingView>
                    <s.SpacerSmall />
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          
        </s.ResponsiveWrapper>

        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "white",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
