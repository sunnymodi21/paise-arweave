import React, { Component } from 'react'
import KeySelect from './KeySelect'
import InfoModal from './InfoModal'
import SignedIn from './SignedIn'
import './Landing.css'

class Landing extends Component {
  constructor(props){
    super(props)
    this.state = {
      infoModal: false,
      isUserKeySet: false,
      userKey:{}
    }
  }

  processKeyFile(files){
    let file = files[0]
    if (file!==undefined && /\.(json)$/i.test(file.name)) {
      this.setState({
        loader: true
      })
      const reader  = new FileReader()
      reader.onload= (e)=>{
        let data = e.target.result
        const userKey = JSON.parse(data);
        this.setState({
          isUserKeySet: true,
          userKey
        })
      }
      reader.readAsText(file)
    } else {
      this.info = "File not supported. Please upload a .JSON file"
      this.setState({
        infoModal: true
      })
    }
  }

  onInfoModalClose(){
    this.setState({
      infoModal: false
    })
  }

  landingHtml(){
    return <div className="masthead d-flex">
        <div className="container text-center my-auto">
          <h1 className="mb-1">Paise</h1>
          <h4 className="mb-4">
            <em>A decentralized expense manager to track and get insight into your spending</em>
          </h4>
          <div className="p-1"><KeySelect processKeyFile={this.processKeyFile.bind(this)} > </KeySelect></div>
          <div  className="p-1">
            <button
              className="btn btn-primary"
              onClick={()=>window.open('https://tokens.arweave.org/')}
              >Don't have a key? Click to get new key.
            </button>
          </div>
        </div>
        <div className="overlay"></div>
        {this.state.infoModal?
            <InfoModal info={this.info} handleClose={this.onInfoModalClose.bind(this)}/>:''} 
      </div>
  }

  render() {
    const userKey = this.state.userKey
    return (
      this.state.isUserKeySet? <SignedIn userKey={userKey} />: this.landingHtml()
    );
  }
}

export default Landing
